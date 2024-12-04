const express = require("express");
const router = express.Router({ mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, loggedIn } = require("../middleware.js");

const reviewController = require("../controllers/review.js");

//listing[id] --> review 
router.post("/",
    loggedIn,
    validateReview,  
    wrapAsync(reviewController.createReview ));
  
//delete route --> review[id]
router.delete("/:reviewId", 
    wrapAsync( reviewController.destroyReview))

module.exports = router;