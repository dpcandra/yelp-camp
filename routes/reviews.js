const express = require('express');
const router = express.Router({ mergeParams:true });
const catchAsync = require('../utils/catchAsync');
const { validateReview,isLoggedin,isReviewAuthor } = require('../middleware');
const reviewsController = require('../controllers/reviewsController');

router.post('/',isLoggedin, validateReview, catchAsync(reviewsController.createReview));

router.delete('/:reviewId', isLoggedin,isReviewAuthor,catchAsync(reviewsController.deleteReview));

module.exports = router;