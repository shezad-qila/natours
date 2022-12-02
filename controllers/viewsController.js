const Tour = require('../models/tourModel');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const { nextTick } = require('process');
// const { findById } = require('../models/userModels');
// const { findByIdAndUpdate } = require('../models/tourModel');

exports.getOverview = catchAsync(async (req, res) => {
    // Get tours data from collection
    const tours = await Tour.find();

    // Build template
    // Render that templateusing tour data
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
});

exports.getTour = catchAsync(async (req, res, next) => {
    // Get tour data from collection
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'   
    });

    if(!tour) return next(new AppError('There is not any Tour with that name', 404));

    // Render that templateusing tour data
    res.status(200).render('tour', {
        title: `${tour.name}`,
        tour
    })
});

// login page
exports.loginForm = (req, res) => {
    res.status(200).render('login',{
        title: 'login'
    })
}

// user profile
exports.userProfile = (req, res) => {
    res.status(200).render('account',{
        title: 'Your Account Settings'
    });
}

// Update User Data
exports.updateUserData = async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).render('account',{
        title: 'Your Account Settings',
        user: updatedUser
    })
};

exports.getMyTours = (req, res, next) => {
    
}