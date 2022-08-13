const { default: axios } = require('axios');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');

module.exports = {
  overview: async function (req, res) {
    const tours = await Tour.find();
    res.render('overview.ejs', {
      title: 'Overview',
      tours,
      user: req.user,
    });
    // res.status(200).json(tours);
  },
  tour: async function (req, res) {
    const currTour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    res.render('tour.ejs', { tour: currTour });
  },

  getLoginForm: async (req, res) => {
    res.status(200).render('login.ejs');
  },

  getMyAccountPage: async (req, res) => {
    res.status(200).render('account');
  },

  updateUser: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { email: req.body.email, name: req.body.name },
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).render('account', { user: updatedUser });
    } catch (err) {
      console.log(err);
    }
  },
};
