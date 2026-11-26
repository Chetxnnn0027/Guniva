if(process.env.NODE_ENV != "production"){
 require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const reviewsRouter = require("./routes/review.js");
const bookingRouter = require("./routes/booking.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LoclalStrategy = require("passport-local");
const User = require("./models/users.js");

let port = 8080;

const MONGO_URL = process.env.MONGO_URL;

main()
  .then(()=>{
    console.log("Connected to DB");
  })
  .catch((err) =>{
    console.log(err);
  })

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const sessionOption = {
  secret: process.env.SESSION_SECRET,
  resave : false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7*24*60*60*1000,
    httpOnly: true
  }
};

// app.get("/" , (req,res)=>{
//     res.send("hello");
// });

app.use(session(sessionOption));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LoclalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.searchQuery = req.query.q || "";
  next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/privacy", (req, res) => {
  res.render("legal/privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("legal/terms.ejs");
});

app.use("/listings" , listingsRouter);
app.use("/listings/:id/reviews" , reviewsRouter);
app.use("/" , bookingRouter);
app.use("/" , userRouter);

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page not found!!"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  let { statusCode = 500, message = "Something went wrong!!" } = err;
  if (req.originalUrl.includes("/bookings/") || req.is("application/json")) {
    return res.status(statusCode).json({ success: false, message });
  }
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(port , ()=>{
    console.log("server is listening to port 8080");
});