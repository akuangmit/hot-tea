var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../schemas/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
   res.render('index', {isLoggedIn: true, title: 'Home' });
  } else {
    res.render('index', {isLoggedIn: false, title: 'Home' });
  }
});

/* GET directory page */
router.get('/directory', function(req, res, next) {
  if (req.user) {
   res.render('directory', {isLoggedIn: true, title: 'Directory' });
  } else {
    res.render('directory', {isLoggedIn: false, title: 'Directory' });
  }
})

/* GET about page */
router.get('/about', function(req, res, next) {
  if (req.user) {
   res.render('about', {isLoggedIn: true, title: 'About' });
  } else {
    res.render('about', {isLoggedIn: false, title: 'About' });
  }
})

/* GET restaurant profile page */
router.get('/restaurantprofile', function(req, res, next) {
  if (req.user) {
   res.render('restaurantprofile', {isLoggedIn: true, waitTime: req.user.waitTime, title: 'Restaurant Profile' });
  } else {
    res.render('restaurantprofile', {isLoggedIn: false, waitTime: 'not set yet', title: 'Restaurant Profile' });
  }
})

/* GET update wait time page */
router.get('/updatewaittime', function(req, res, next) {
  if (req.user) {
   res.render('updatewaittime', {isLoggedIn: true, title: 'Update Wait Time' });
  } else {
    res.render('updatewaittime', {isLoggedIn: false, title: 'Update Wait Time' });
  }})

/* GET log in form page */
router.get('/loginform', function(req, res, next) {
  if (req.user) {
   res.render('loginform', {isLoggedIn: true, title: 'Log In' });
  } else {
    res.render('loginform', {isLoggedIn: false, title: 'Log In' });
  }
})

/* GET sign up form page */
router.get('/signupform', function(req, res, next) {
  if (req.user) {
   res.render('signupform', {isLoggedIn: true, title: 'Sign Up' });
  } else {
    res.render('signupform', {isLoggedIn: false, title: 'Sign Up' });
  }
})

/* GET search results page */
router.get('/searchresults', function(req, res, next) {
  if (req.user) {
   res.render('searchresults', {isLoggedIn: true, title: 'Search Results' });
  } else {
    res.render('searchresults', {isLoggedIn: false, title: 'Search Results' });
  }
})

/* GET logout */
router.get('/logout', function(req, res, next) {
  if (req.user) {
    req.logout();
  }
  res.render('index');
})

/* POST wait time */
router.post('/waittime', function(req, res, next) {
  Account.findOne({'username': req.user.username}, function(err,user) {
    if (err) {
      console.log('error');
    }
    user.waitTime = req.body.time;
    user.save();
  })
})

/* POST add user */
router.post('/adduser', function(req, res, next) {
    Account.register(new Account({ username : req.body.username}), req.body.password, function(err, account) {
        if (err) {
            console.log("error", err);
            console.log(req.body);
            return res.render('index', { account : account });
        }
        passport.authenticate('local')(req, res, function () {
            console.log(req.user);
            res.redirect('/');
        });
    });
});

/* POST login user */
router.post('/loginuser', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/loginform'
}));

/* GET individual restaurant profile page */
router.get('/users/:username', function(req,res,next) {
  var username = req.params.username;
  if (req.user) {
   res.render('profile', {isLoggedIn: true, name: username, waitTime: req.user.waitTime, title: username });
  } else {
    var waitTime = 0;
    Account.findOne({'username': username}, function(err, user) {
      if (err) {
        console.log('error');
      }
      waitTime = user.waitTime;
      console.log("hello");
      console.log(waitTime);
    });
    console.log(waitTime);
    res.render('profile', {isLoggedIn: false, name: username, waitTime: waitTime, title: username });
  }
});

module.exports = router;
