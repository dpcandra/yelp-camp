const express = require('express');
const router = express.Router();
const campgroundsController = require('../controllers/campgroundsController');
const catchAsync = require('../utils/catchAsync');
const { isLoggedin,isAuthor,validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({storage});

router.route('/')
    .get(catchAsync(campgroundsController.index))
    .post(isLoggedin, upload.array('image'),validateCampground,catchAsync(campgroundsController.createCampground));
    

router.get('/new',isLoggedin, campgroundsController.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgroundsController.showCampground))
    .put(isLoggedin, isAuthor, upload.array('image'),validateCampground, catchAsync(campgroundsController.updateCampground))
    .delete(isLoggedin, isAuthor,catchAsync(campgroundsController.deleteCampground));

router.get('/:id/edit',isLoggedin, isAuthor,catchAsync(campgroundsController.renderEditForm));


module.exports = router;