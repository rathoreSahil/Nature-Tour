const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

router.use(authController.isLoggedIn);
router.get('/', viewController.overview);
router.get('/tour/:slug', viewController.tour);
router.get('/login', viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getMyAccountPage);
router.post(
  '/me',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  viewController.updateUser
);

module.exports = router;
