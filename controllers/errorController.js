const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message,400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    
    const message = `Duplicate field value: ${value} Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = err => new AppError('Invalid token. Please login again!', 401);
const handleJWTExpiredError = err => new AppError('Your token has been expired! Please login again.', 401);

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')){
        // API
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }else{
        // RENDERED WEBSITE
        return res.status(err.statusCode).render('error',{
            title: 'Something went wrong!',
            msg: err.message
        })
    }
};

const sendErrorProd = (err, res) => {
    if(req.originalUrl.startsWith('/api')){
        // Operational, trusted error: send message to client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });

        // Progeaming and other unknown error: don't leak error details
        }else{
            // 1) Log Error
            // console.error('Error ', err);

            // 2) Send generic message
            return res.status(500).json({
                status: 'fail',
                message: 'Something went wrong on our end'
            });
        }
    }else{
        // RENDERED WEBSITE
        // Operational, trusted error: send message to client
        if(err.isOperational){
            return res.status(err.statusCode).render('error',{
                title: 'Something went wrong!',
                msg: err.message
            })

        // Progeaming and other unknown error: don't leak error details
        }else{
            // 1) Log Error
            // console.error('Error ', err);

            // 2) Send generic message
            return res.status(err.statusCode).render('error',{
                title: 'Something went wrong!',
                msg: 'Please try again later.'
            })
        }
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = { ...err };
        
        if(err.name === 'CastError') err = handleCastErrorDB(err);
        if(err.code === 11000) err = handleDuplicateFieldsDB(err);
        if(err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if(err.name === 'JsonWebTokenError') err = handleJWTError(err);
        if(err.name === 'TokenExpiredError') err = handleJWTExpiredError(err);

        sendErrorProd(err, res);
    }
}