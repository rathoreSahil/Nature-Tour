const Tour = require('./../models/tourModel');

module.exports = {
  overview: async function (req, res) {
    const tours = await Tour.find();

    res.render('overview', {
      title: 'Overview',
      tours,
    });
  },
  tour: function (req, res) {
    res.render('tour', {
      title: 'forest hiker',
    });
  },
};
