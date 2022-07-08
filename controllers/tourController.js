const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    console.log(new Date(`${year}-01-01`).toISOString());
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`).toISOString(),
            $lte: new Date(`${year}-12-31`).toISOString(),
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'suck ass',
      results: plan.length,
      data: plan,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
