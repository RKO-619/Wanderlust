const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    return Promise.resolve(res.render("listings/new.ejs"));
};

 module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
       console.log(listing.owner);
 
    if (!listing) {
       req.flash("error", "Listing you requested for does not exist!");
       return res.redirect("/listings");
    }
 
 
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
       .send();
       
    let url = req.file.path;
    let filename = req.file.filename;

    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = { url, filename};

    newlisting.geometry = response.body.features[0].geometry;

    let savelisting = await newlisting.save();
    console.log(savelisting)
    req.flash("success", "New listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
       req.flash("error", "Listing you requested for does not exist!")
       res.redirect("/listings");
    }

    let orginalImageUrl = listing.image.url;
    orginalImageUrl = orginalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, orginalImageUrl });
};

module.exports.updateListing = async (req,res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename};
        await listing.save();
    }
    req.flash("success", "listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
    deleteListing =  await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "listing deleted!");
    res.redirect("/listings");
};