const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require(`${__dirname}/../models/tourModel`);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res) => {
    // Get the booked tour
    const tour = await Tour.findById(req.params.tourId);

    // create check session
    const product = await stripe.products.create({
        name: `${tour.name} Tour`,
        description: `${tour.summary} Tour`,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
    });

    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tour.price * 100,
        currency: 'usd',
    });

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
                    },
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    });

    // send response
    res.status(200).json({
       status: 'success',
       session 
    });
});