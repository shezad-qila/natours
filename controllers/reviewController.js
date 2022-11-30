const Review = require(`${__dirname}/../models/reviewModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
};

// Create Review
exports.createReview = factory.createOne(Review);

// Get All Reviews
exports.getReviews = factory.getAll(Review);

// get review 
exports.getReview = factory.getOne(Review);

// update review
exports.updateReview = factory.updateOne(Review);

// delete review
exports.deleteReview = factory.deleteOne(Review);