const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.js");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.post("/listings/:id/bookings/create-order", isLoggedIn, wrapAsync(bookingController.createOrder));

router.post("/bookings/verify", isLoggedIn, wrapAsync(bookingController.verifyPayment));

module.exports = router;
