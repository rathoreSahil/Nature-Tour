const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');

router.get('/', viewController.overview);

router.get('/tour', viewController.tour);

module.exports = router;
