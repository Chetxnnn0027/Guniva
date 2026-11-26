const Listing = require("../models/listing.js");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function geocodeLocation(location, country) {
  const query = country ? `${location}, ${country}` : location;
  const response = await geocodingClient.forwardGeocode({
    query,
    limit: 1
  }).send();

  if (!response.body.features.length) {
    return null;
  }
  return response.body.features[0].geometry;
}

module.exports.index = async (req, res) => {
  const { q, category } = req.query;
  const filter = {};

  if (q && q.trim()) {
    const safeRegex = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [
      { title: safeRegex },
      { location: safeRegex },
      { country: safeRegex }
    ];
  }

  if (category && category.trim()) {
    filter.category = category.trim();
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", {
    allListings,
    searchQuery: q ? q.trim() : "",
    activeCategory: category ? category.trim() : ""
  });
};

module.exports.renderNewForm = (req,res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id)
  .populate({path : "reviews" , 
    populate: {
      path: "author",
    },
  })
  .populate("owner");
    if(!listing){
    req.flash("error" , "Listing you requested for does not exist!")
    return res.redirect("/listings"); 
  }
  res.render("listings/show.ejs" , {listing});
};

module.exports.createListing = async (req, res) => {
  if (!req.file) {
    req.flash("error", "Please upload a listing image!");
    return res.redirect("/listings/new");
  }

  const geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country);
  if (!geometry) {
    req.flash("error", "Location not found! Please enter a valid city or address.");
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url: req.file.path, filename: req.file.filename };
  newListing.geometry = geometry;

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image && listing.image.url ? listing.image.url : "";
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_400,c_fill");
  }
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListings = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (req.body.listing && req.body.listing.location) {
    const geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country);
    if (geometry) {
      listing.geometry = geometry;
    }
  }

  if (typeof req.file !== "undefined") {
    listing.image = { url: req.file.path, filename: req.file.filename };
  }

  await listing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};