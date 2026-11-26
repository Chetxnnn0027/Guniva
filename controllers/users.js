const User = require("../models/users.js");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async(req,res,next)=>{
    try{
    let {username , email , password} = req.body;
    const newUser = new User({email , username});
    const resgisteredUser = await User.register(newUser , password);
    req.login(resgisteredUser , (err)=>{
        if(err){
            return next(err);
        }
    req.flash("success" , "Welcome to Guniva");
    res.redirect("/listings");
    });
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }

};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("success" ,"Welcome back to Guniva");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success" , "You are logged out");
        res.redirect("/listings");
    });
};

