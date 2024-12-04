const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { loggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
   .route("/")
   .get( wrapAsync(listingController.index))
   .post(  
      loggedIn,
      upload.single("listing[image]"),
      validateListing,
      wrapAsync(listingController.createListing)
   );
      
//New route
router.get("/new", loggedIn, wrapAsync(listingController.renderNewForm));

router
   .route("/:id")
   .get(wrapAsync(listingController.showListing))
   .put(
      isOwner,
      upload.single("listing[image]"),
      validateListing,
      wrapAsync(listingController.updateListing)
   )
   .delete(
      isOwner,
      loggedIn,
      wrapAsync(listingController.destroyListing)
   );

//Edit route
router.get("/:id/edit", 
   isOwner,
   loggedIn,
   wrapAsync(listingController.renderEditForm));

module.exports = router;