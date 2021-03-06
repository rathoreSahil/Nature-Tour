const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');

router.get('/', viewController.overview);
router.get('/tour/:slug', viewController.tour);

module.exports = router;
