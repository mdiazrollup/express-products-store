const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0]
  }else {
    message = null;
  }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
      });
  };

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0]
  }else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email: email})
    .then(user => {
      if(!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
      .then(doMatch => {
        if(doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
      })
      .catch(err => {
        console.log(err);
        res.redirect('/login');
      });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email})
  .then(userDoc => {
    if(userDoc) {
      req.flash('error', 'Email exists already.');
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      transporter.sendMail({
        to: email,
        from: 'mariangeles112@gmail.com',
        subject: 'SignUp completed',
        html: '<h1>You successfully signup</h1>'
      })
      .catch(err => console.log(err));
      
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