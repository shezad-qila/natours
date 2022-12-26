const express= require("express");
const tourController= require("./../controllers/tourController");
const authController = require('./../controllers/authController');
const bookingController= require("./../controllers/bookingController");
const reviewRouter = require('./reviewRoutes');


const router = express.Router();

// router.param('id',tourController.checkId)

router.use('/:tourId/reviews', reviewRouter);

router
    .get(
        '/:tourId/bookings', 
        authController.protect, 
        authController.restrictTo('admin'),
        bookingController.getTourBookings
    );

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours,tourController.getTours);

router
    .route('/tour-stats')
    .get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(authController.protect, 
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan
    );

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getTourWithin);
// /tour-distance?distance=233&center=-40,45&unit=mi
// /tour-distance/233/center/-40,45/unit/mi

router
    .route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getTours)
    .post(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'),
        tourController.creatTour
    );

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour
    );

// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview
//     );

module.exports = router;