const Review = require(`${__dirname}/../models/reviewModel`);
const Booking = require(`${__dirname}/../models/bookingModel`);
const factory = require('./handlerFactory');
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const AppError = require(`${__dirname}/../utils/appError`);

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
};

// verify user before review if he actually booked a tour
exports.userCheckBooking = catchAsync(async (req, res, next) => {
    const bookings = await Booking.findOne({ user: req.body.user, tour: req.body.tour });
    if(!bookings){
        return next(new AppError('Only Users that booked Tour Give Review', 404));
    }

    next();
});

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