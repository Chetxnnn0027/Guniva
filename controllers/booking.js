const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

module.exports.createOrder = async (req, res) => {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return res.status(500).json({ success: false, message: "Razorpay keys are not configured" });
  }

  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  // Always validate & calculate price on the server (never trust frontend price)
  const nights = Math.max(1, parseInt(req.body.nights, 10) || 1);
  const totalAmount = Math.round(listing.price * nights * 1.18); // includes 18% GST

  let order;
  try {
    order = await razorpay.orders.create({
      amount: totalAmount * 100, // Razorpay expects amount in paise (integer)
      currency: "INR",
      receipt: `guniva_${Date.now()}`,
    });
  } catch (err) {
    const msg = err?.error?.description || err?.message || "Razorpay order creation failed";
    return res.status(502).json({ success: false, message: msg });
  }

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    nights,
    totalAmount,
    razorpayOrderId: order.id,
    status: "pending",
  });

  await booking.save();

  res.json({
    success: true,
    order,
    keyId: process.env.RAZORPAY_KEY_ID,
    totalAmount,
  });
};

module.exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await Booking.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, user: req.user._id },
      { status: "paid", razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    req.flash("success", "Booking confirmed! Payment successful.");
    return res.json({ success: true, message: "Payment verified" });
  }

  await Booking.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, user: req.user._id },
    { status: "failed" }
  );

  return res.status(400).json({ success: false, message: "Payment verification failed" });
};