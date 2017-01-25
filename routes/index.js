var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../schemas/user');
const uuidV4 = require('uuid/v4');

/* convert wait time in minutes to display time */
function displayTime(time) {
  if (time == 999) {
    return "Closed";
  }

  else if (time == 240) {
    return "Unknown";
  }

  else if (time == 0) {
    return "No Wait";
  } 

  else if (time > 60) {
    var hours = time/60;
    var minutes = time%60;
    if (minutes == 0) {
      return hours.toString() + " hours";
    }
    return hours.toString() + " hours " + minutes.toString() + " minutes";
  } 

  else {
    return time.toString() + " minutes";
  }
}

/* convert time since last wait time update in minutes to display time since update */
function displayTimeSinceUpdate(time) {
  time = Math.floor(time/60000);
  if (time<1) {
    return "<1 minute ago";
  } else if (time > 60) {
    return ">1 hour ago";
  } else if (time > 120) {
    return ">2 hours ago";
  } else {
    return time.toString() + " minutes ago";
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
   res.render('index', {isLoggedIn: true, title: 'Home', url: req.user.id});
  } else {
    res.render('index', {isLoggedIn: false, title: 'Home' });
  }
});

/* GET directory page */
router.get('/directory', function(req, res, next) {
  var all_accounts;
  Account.find({}, {_id:false, username: true, waitTime: true, restaurantName: true, timeOfUpdate: true, id: true}, function(err, users){
    var usersNew = [];
    for (var user in users) {
      usersNew[user] = {};
      usersNew[user].username = users[user].username;
      usersNew[user].id = users[user].id;
      usersNew[user].restaurantName = users[user].restaurantName;
      usersNew[user].waitTime = displayTime(users[user].waitTime);
      usersNew[user].timeSinceUpdate = displayTimeSinceUpdate(Date.now()-users[user].timeOfUpdate);
    }
    if (req.user){
      res.render('directory', {isLoggedIn: true, users: usersNew, url: req.user.id});
    }
    else {
      res.render('directory', {isLoggedIn: false, users:usersNew});
    }
  }).sort({waitTime:1, timeOfUpdate:-1});
})

/* GET about page */
router.get('/about', function(req, res, next) {
  if (req.user) {
   res.render('about', {isLoggedIn: true, title: 'About', url: req.user.id});
  } else {
    res.render('about', {isLoggedIn: false, title: 'About' });
  }
})

/* GET update wait time page */
router.get('/updatewaittime', function(req, res, next) {
  if (req.user) {
    console.log(req.user.restaurantName);
   res.render('updatewaittime', {isLoggedIn: true, title: 'Update Wait Time', 
    restaurantName: req.user.restaurantName, waitTime: displayTime(req.user.waitTime), 
    timeSinceUpdate: displayTimeSinceUpdate(Date.now()-req.user.timeOfUpdate), url: req.user.id});
  } else {
    res.render('updatewaittime', {isLoggedIn: false, title: 'Update Wait Time'});
  }})

/* GET log in form page */
router.get('/loginform', function(req, res, next) {
  if (req.user) {
   res.render('loginform', {isLoggedIn: true, title: 'Log In', url: req.user.id});
  } else {
    res.render('loginform', {isLoggedIn: false, title: 'Log In' });
  }
})

/* GET sign up form page */
router.get('/signupform', function(req, res, next) {
  if (req.user) {
   res.render('signupform', {isLoggedIn: true, title: 'Sign Up', url: req.user.id });
  } else {
    res.render('signupform', {isLoggedIn: false, title: 'Sign Up' });
  }
})

/* GET search results page */
router.get('/searchresults', function(req, res, next) {
  if (req.user) {
   res.render('searchresults', {isLoggedIn: true, title: 'Search Results', url: req.user.id});
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
    user.timeOfUpdate = req.body.timeOfUpdate;
    user.save();
    res.send("success");
    //res.redirect("/");
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
    account.id = uuidV4();
    account.restaurantName = req.body.restaurantName;
    account.timeOfUpdate = Date.now();
    account.restaurantDescription = "hello";
    account.save();
    });
    
});

/* POST login user */
router.post('/loginuser', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/loginform'
}));

/* POST edit description */
router.post('/editDescription', function(req, res, next) {
  Account.findOne({'username': req.user.username}, function(err, user) {
    if (err) {
      console.log('error');
    }
    user.restaurantDescription = req.body.restaurantDescription;
    user.save();
    res.redirect('/users/' + req.user.id);
  });
});

/* GET individual restaurant profile page */
router.get('/users/:id', function(req,res,next) {
  var id = req.params.id;
  if (req.user) {
    Account.findOne({'id': id}, function(err, user) {
      if (err) {
        console.log('error');
      } else {
        res.render('profile', {isLoggedIn: true, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
          title: user.restaurantName, timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), 
          restaurantDescription: user.restaurantDescription, url: req.user.id});
      }
    });
  } else {
    Account.findOne({'id': id}, function(err, user) {
      if (err) {
        console.log('error');
      } else {
        res.render('profile', {isLoggedIn: false, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
          timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), 
          restaurantDescription: user.restaurantDescription, title: user.restaurantName});
      }
    });
  }
});

module.exports = router;
