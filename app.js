const path = require('path');
const pug = require('pug');
const express= require("express");
const morgan = require("morgan");
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss= require('xss-clean');
const hpp= require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter=require("./routes/tourRoutes");
const userRouter=require("./routes/userRoutes");
const reviewRouter=require("./routes/reviewRoutes");
const bookingRouter=require("./routes/bookingRoutes");
const viewRouter=require("./routes/viewRoutes");

const app=express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL Middlewares

// serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// set security HTTP headers
app.use(helmet());

// Development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit:'10kb' }));
app.use(cookieParser());

// Parse form data to controller
app.use(express.urlencoded({ extended : true, limit : '10kb'  }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// prevent parameters polutuion
app.use(
    hpp({
        whitelist: [
            'duration', 
            'ratingQuantity', 
            'ratingAverage', 
            'maxGroupSize', 
            'difficulty', 
            'price'
        ]
    })
);

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.use('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;