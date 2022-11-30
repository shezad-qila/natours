const express = require('express');
const bookinsController = require(`${__dirname}/../controllers/bookinsController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router
    .get(
        '/checkout-session/:tourId', 
        authController.protect,
        bookinsController.getCheckoutSession
    );

module.exports = router;