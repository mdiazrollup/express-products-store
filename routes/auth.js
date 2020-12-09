const path = require('path');
const {check, body} = require('express-validator');

const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
[
    body('email', 'Please enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Please enter a password with at least 5 characters').isLength({min: 5}).isAlphanumeric().trim()
],
authController.postLogin);

router.post('/signup', 
[
    check('email').isEmail().withMessage('Please enter a valid email')
    .custom((value, {req}) => {
        // if(value === 'test@test.com') {
        //     throw new Error('email forbidden')
        // }
        // return true;
        // Express validator wait for the promise to be resolve
        return User.findOne({email: value})
        .then(userDoc => {
            if(userDoc) {
                return Promise.reject('Email exists already.');
            }
        });
    }).normalizeEmail(),
    body('password', 'Please enter a password with at least 5 characters')
    .isLength({min: 5}).isAlphanumeric().trim(),
    body('confirmPassword').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords have to match.')
        }
        return true;
    }).trim()
],
 authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;