const express= require("express");
const userController= require("./../controllers/userController");
const authController= require("./../controllers/authController");

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
// router.route('/logout').get(authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// protect All routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
    '/updateUserRecord', 
    userController.uploadUserPhoto, 
    userController.resizeUserPhoto,
    userController.updateUserRecord 
);
router.delete('/deleteUserRecord', userController.deleteUserRecord );

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;