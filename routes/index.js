var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET directory page */
router.get('/directory', function(req, res, next) {
	res.render('directory', { title: 'Directory' });
})

/* GET about page */
router.get('/about', function(req, res, next) {
	res.render('about', { title: 'About' });
})

/* GET restaurant profile page */
router.get('/restaurantprofile', function(req, res, next) {
	res.render('restaurantprofile', { title: 'Restaurant Profile' });
})

/* GET update wait time page */
router.get('/updatewaittime', function(req, res, next) {
	res.render('updatewaittime', { title: 'Update Wait Time' });
})

/* GET log in form page */
router.get('/loginform', function(req, res, next) {
	res.render('loginform', { title: 'Log In' });
})

/* handle login POST*/
router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

/* GET sign up form page */
router.get('/signupform', function(req, res, next) {
	res.render('signupform', { title: 'Sign Up' });
})

/* handle register POST */
router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

/* GET search results page */
router.get('/searchresults', function(req, res, next) {
	res.render('searchresults', { title: 'Search Results' });
})


module.exports = router;
