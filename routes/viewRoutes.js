const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require(`${__dirname}/../controllers/bookingController`);

const router = express.Router();

// router.use();

router.get(
    '/', 
    bookingController.createBookingCheckout,
    authController.isLoggedIn, 
    viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.loginForm);
router.get('/me', authController.protect, viewsController.userProfile);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;