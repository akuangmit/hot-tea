var express = require('express');
var router = express.Router();

var User = require('../schemas/user');
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

/* GET sign up form page */
router.get('/signupform', function(req, res, next) {
	res.render('signupform', { title: 'Sign Up' });
})

/* GET search results page */
router.get('/searchresults', function(req, res, next) {
	res.render('searchresults', { title: 'Search Results' });
})
// POST add user page for sign up form
router.post('/adduser', function(req, res, next) {
  console.log(req.body);
  console.log("For Signup Page");
  var email_address = req.body.email_address;
  var password = req.body.password;
  // db.usercollect.insert({'email_address': email_address, 'password': password}) 
  // user.save();
  // User.findOne({'name': email_address}, function(err, user){
  //   // if (err) {
  //   //   user.username = username;
  //   //   user.userfruit = userFruit;
  //   // }
  //   // console.log(user);
  //   // user.save();
  //   res.redirect('/');
  // })
   var newUser = new User({
    'email_address': email_address,
    'password': password
  });
  newUser.save();
  // User.find({}, function(err, users) {
  //   res.send(users);
  // });
//I feel like users is made when you do User.find({}). Therefore, the new one won't show until next page update!
    res.send(newUser);
})


// POST add user page for login form
router.post('/loginuser', function(req, res, next) {
  console.log(req.body);
  console.log("For Login Form");
  var email_address = req.body.email_address;
  var password = req.body.password;
  User.findOne({'email_address': email_address}, function(err, user) {
    if (err) {
      res.send('An error occurred!');
    } else {
      if (user) {
        res.send("Exists");
      } else {
        // If the user does not exist, use this line of code below.
        var newUser = new User({
    'email_address': email_address,
    'password': password
  });
        newUser.save();
        res.send(newUser);
      }
    }
  });
  //   User.find({}, function(err, users) {
  //   res.send(users);
  // });
})

module.exports = router;
