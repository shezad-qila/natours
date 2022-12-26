const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require(`${__dirname}/../models/tourModel`);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res) => {
    // Get the booked tour
    const tour = await Tour.findById(req.params.tourId);

    // const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     success_url: `${req.protocol}://${req.get('host')}/`,
    //     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    //     customer_email: req.user.email,
    //     client_reference_id: req.params.tourId,
    //     line_items: [{
    //         name: `${tour.name} Tour`,
    //         description: `${tour.summary} Tour`,
    //         images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
    //         amount: tour.price * 100,
    //         currency: 'usd',
    //         price: price.id,    
    //         quantity: 1,
    //     }],
    //     mode: 'payment',
    // });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: "inr",
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: `${tour.summary} Tour`,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
                        // unit_amount: tour.price * 100,
                        // quantity: 1,
                        // currency: "inr",
                    },
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    });

    // send response
    res.status(200).json({
       status: 'success',
       session 
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if(!tour && !user && !price) return next();
    const booking = await Booking.create({ tour, user, price });
    console.log(booking);

    res.redirect(req.originalUrl.split('?')[0]);
});

// get bookings for by User id
exports.getUserBookings = catchAsync(async (req, res, next) => {
    const booking = await Booking.find({ user: req.params.userId });

    if(!booking) return next(new AppError('You don`t booked any tour yet.', 404));

    res.status(200).json({
        status: 'success',
        results: booking.length,
        data: booking
    });
});

// get bookings for by tour id
exports.getTourBookings = catchAsync(async (req, res, next) => {
    const booking = await Booking.find({ tour: req.params.tourId });

    if(!booking) return next(new AppError('There is n`t any booking for tour.', 404));

    res.status(200).json({
        status: 'success',
        results: booking.length,
        data: booking
    });
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);