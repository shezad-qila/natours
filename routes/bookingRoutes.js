const express = require('express');
const bookingController = require(`${__dirname}/../controllers/bookingController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router
    .get(
        '/checkout-session/:tourId', 
        authController.protect,
        bookingController.getCheckoutSession
    );

module.exports = router;