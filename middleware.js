const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// Middleware to ensure the user is authenticated
module.exports.loggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if( req.session.redirectUrl) {
        res.locals.redirectUrl =  req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
       let { id } = req.params;
       let listing = await Listing.findById(id);
       if (!listing) {
          req.flash("error", "Listing not found");
          return res.redirect("/listings");
       }
       if (!res.locals.currUser) {
          req.flash("error", "You must be logged in to perform this action");
          return res.redirect("/login");
       }
       if (!listing.owner.equals(res.locals.currUser._id)) {
          req.flash("error", "You are not the owner of this listing");
          return res.redirect(`/listings/${id}`);
       }
       next();
    } catch (err) {
       console.error(err);
       req.flash("error", "Something went wrong");
       res.redirect("/listings");
    }
 };


module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    }else{
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
        let { reviewId, id } = req.params;
        let foundReview = await Review.findById(reviewId); // Rename the variable to avoid shadowing
        
        if (!foundReview) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }

        if (!foundReview.author.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }

        next();
};

 