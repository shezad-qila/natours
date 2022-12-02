const express = require('express');
const bookingController = require(`${__dirname}/../controllers/bookingController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .post(bookingController.createBooking)
    .get(bookingController.getAllBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;