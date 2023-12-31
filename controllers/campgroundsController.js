const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoiY2FuZHJhZGhwIiwiYSI6ImNsamloNjNxOTAwNnkzanQ4NTM3YWkxN3QifQ.nq_aA1IGe24-r1TOOfQNoQ';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res,next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'New Campground has been saved!');
    res.redirect(`/campgrounds/${campground.id}`);
}

module.exports.showCampground = async (req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path: 'author'
        }
    }).populate('author');
    if(campground){
        res.render('campgrounds/show', { campground });
    }else{
        req.flash('error','Sorry, Campground not Found!')
        res.redirect('/campgrounds');
    }
}

module.exports.renderEditForm = async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Sorry, Campground not Found!')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async(req,res)=>{
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images:{filename:{$in: req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success', 'Campground has been updated!');
    res.redirect(`/campgrounds/${campground.id}`);
}

module.exports.deleteCampground = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground has beed deleted!');
    res.redirect('/campgrounds');
}