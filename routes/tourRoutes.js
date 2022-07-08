const express = require('express');
const fs = require('fs');
const router = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// router.param('id', tourController.checkID);

// routing to reviewRouter for this particular tour reviews
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/monthly-plan/:year')
  .get(
    tourController.getMonthlyPlan,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide')
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
