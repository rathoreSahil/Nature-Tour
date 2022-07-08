module.exports = {
  overview: function (req, res) {
    res.render('overview', {
      title: 'Overview',
    });
  },
  tour: function (req, res) {
    res.render('tour', {
      title: 'forest hiker',
    });
  },
};
