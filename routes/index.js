var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../schemas/user');
const uuidV4 = require('uuid/v4');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
   res.render('index', {isLoggedIn: true, title: 'Home', url: req.user.ID});
  } else {
    res.render('index', {isLoggedIn: false, title: 'Home' });
  }
});

/* GET directory page */
router.get('/directory', function(req, res, next) {
  var all_accounts;
  Account.find({}, {_id:false, username: true, waitTime: true, restaurantName: true}, function(err, users){
    if (req.user){
      res.render('directory', {isLoggedIn: true, users:users, url: req.user.ID});
    }
    else {
      res.render('directory', {isLoggedIn: false, users:users});
    }
  }).sort({waitTime:1});
})

/* GET about page */
router.get('/about', function(req, res, next) {
  if (req.user) {
   res.render('about', {isLoggedIn: true, title: 'About', url: req.user.ID});
  } else {
    res.render('about', {isLoggedIn: false, title: 'About' });
  }
})

/* GET update wait time page */
router.get('/updatewaittime', function(req, res, next) {
  if (req.user) {
    console.log(req.user.restaurantName);
   res.render('updatewaittime', {isLoggedIn: true, title: 'Update Wait Time', 
    restaurantName: req.user.restaurantName, waitTime: req.user.waitTime, 
    url: req.user.ID});
  } else {
    res.render('updatewaittime', {isLoggedIn: false, title: 'Update Wait Time'});
  }})

/* GET log in form page */
router.get('/loginform', function(req, res, next) {
  if (req.user) {
   res.render('loginform', {isLoggedIn: true, title: 'Log In', url: req.user.ID});
  } else {
    res.render('loginform', {isLoggedIn: false, title: 'Log In' });
  }
})

/* GET sign up form page */
router.get('/signupform', function(req, res, next) {
  if (req.user) {
   res.render('signupform', {isLoggedIn: true, title: 'Sign Up', url: req.user.ID });
  } else {
    res.render('signupform', {isLoggedIn: false, title: 'Sign Up' });
  }
})

/* GET search results page */
router.get('/searchresults', function(req, res, next) {
  if (req.user) {
   res.render('searchresults', {isLoggedIn: true, title: 'Search Results', url: req.user.ID});
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
  Account.findOne({'username': req.user.username}, function(err, user) {
    if (err) {
      console.log('error');
    }
    user.waitTime = req.body.time;
    user.save();
  });
});

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
    account.waitTime=240;
    console.log(req.body.restaurantName);
    account.ID = uuidV4();
    account.restaurantName = req.body.restaurantName;
    account.save();
    });
    
});

/* POST login user */
router.post('/loginuser', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/loginform'
}));

/* GET individual restaurant profile page */
router.get('/users/:ID', function(req,res,next) {
  var ID = req.params.ID;
  if (req.user) {
   res.render('profile', {isLoggedIn: true, restaurantName: req.user.restaurantName, waitTime: req.user.waitTime, title: req.user.restaurantName, url: req.user.ID});
  } else {
    var waitTime = 0;
    Account.findOne({'ID': ID}, function(err, user) {
      if (err) {
        console.log('error');
      } else {
        res.render('profile', {isLoggedIn: false, restaurantName: user.restaurantName, waitTime: user.waitTime, title: user.restaurantName });
      }
    });
  }
});

module.exports = router;
