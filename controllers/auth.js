const User = require('../models/user');

exports.getLogin = (req, res, next) => {
   // const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true';
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.user
      });
  };

exports.postLogin = (req, res, next) => {
  User.findById('5f9b3f07798a700cc640d206')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};