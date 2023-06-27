const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Thank you for your Review!');
    res.redirect(`/campgrounds/${campground.id}`);
}

module.exports.deleteReview = async(req,res,next) =>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review has been remove!');    
    res.redirect(`/campgrounds/${id}`);
}