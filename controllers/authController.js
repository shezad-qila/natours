const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const bcrypt = require('bcryptjs');
const { findById } = require('./../models/userModels');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptond = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * (24*60*60*1000)
        ),
        // secure: true,
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production') cookieOptond.sucure = true;

    res.cookie('jwt', token, cookieOptond);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
    
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    
    // send response
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email);
    // 1) check if email and password exist
    if(!email || !password) return next(new AppError('Please provide email and password!',400));

    // 2) check if user exist and password is coreect
    const user = await User.findOne({email}).select('+password');
    
    if(!user || !(await user.correctPassword(password, user.password))){
    // if(!user || !(await bcrypt.compare(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) send token to client if everything okay 
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedoout', {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    // getting token from header
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    if(!token) return next(new AppError('You are not looged in! Please login to get access.', 401));

    // verify token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user exist or onot
    const freshUser = await User.findById(decode.id);
    if(!freshUser) return next(new AppError('The user belong to this token does not longer exist.', 401));

    // check if user changed password after issued token
    if(freshUser.changedPasswordAfter(decode.iat)){
        return next(
            new AppError('User recently changed password! Please login again.', 401)
        )
    }

    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

exports.isLoggedIn = async (req, res, next) => {
    if(req.cookies.jwt){
        try{
            // verify token
            const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // check if user exist or onot
            const freshUser = await User.findById(decode.id);
            if(!freshUser) return next();

            // check if user changed password after issued token
            if(freshUser.changedPasswordAfter(decode.iat)){
                return next();
            }

            res.locals.user = freshUser;
            return next();
        } catch(err){
            return next();
        }
    }
    return next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have a permission to perform this action', 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on user posted email 
        const user = await User.findOne({ email: req.body.email });
        if(!user){
            return next(new AppError('There is no user with that email address.', 404));
        }

    // 2) Generate the random reset token
        const resetToken = user.createResetPasswordToken();
        await user.save({ validateBeforeSave: false });

    // Sent Mail
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Please change your password click on the Url: ${resetUrl} It will be valid for 10 minutes only. Please ignore if you not forgot your password`;
        
    // await sendEmail({
    //     email: user.email,
    //     subject: "Reset Password",
    //     message
    // });
    await new Email(user, resetUrl).sendResetPassword();

    res.status(200).json({
        status: 'success',
        message: 'Email sent successfully for reset password'
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ 
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) if token has not expired and user exist set new password
    if(!user){
        return next(new AppError('Invalid Token', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) update changedPasswordAt field for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user._id).select('+password');

    // 2) check if posted cureent user is correct
    if(!user || !(await user.correctPassword(req.body.currentPassword, user.password))){
        return next(new AppError('Invalid current password', 401));
    }

    // 3} update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // user.findByIdAndUpdate will NOT work as intended!

    // 4) send JWT token and user logedin here
    createSendToken(user, 200, res);
});