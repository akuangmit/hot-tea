var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../schemas/user');
var path = require('path');
var fs = require('fs');
var schedule = require('node-schedule');
const aws = require('aws-sdk');
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const uuidV4 = require('uuid/v4');
aws.config.region = 'us-east-1';


/* convert wait time in minutes to display time */
function displayTime(time) {
  if (time === 999) {
    return "Closed";
  }

  else if (time === 240) {
    return "Unknown";
  }

  else if (time === 0) {
    return "No Wait";
  } 

  else if (time >= 180) {
    return "3+ hours";
  }

  else if (time > 60) {
    var hours = Math.floor(time/60);
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

function displayAddress(address) {
  if (address["Street"] === "") {
    return "";
  }
  return address["Street"] + ", " + address["City"] + ", " + address["State"] + " " + address["Zip"];
}

var j = schedule.scheduleJob('0 0 0 * * *', function() {
  Account.find({}, {_id:true, username: true, waitTime: true, restaurantName: true, timeOfUpdate: true, 
    previousTimes: true, currentDay: true, lastWaitTime: true, id: true}, function(err, users){
      for (var index in users) {
        user = users[index];
        var currentDate = new Date();
        var dayOfWeek = (currentDate.getDay()-1)%7;
        var dayAverages = calculateAverageWait(user.currentDay, user.lastWaitTime);
        user.previousTimes[dayOfWeek] = dayAverages;
        var lastWaitInput = Object.keys(user.currentDay[23][user.currentDay[23].length-1])[0];
        user.lastWaitTime = user.currentDay[23][user.currentDay[23].length-1][lastWaitInput];
        for (var i = 0; i < 24; i++) {
          user.currentDay[i] = [];
        }
        user.markModified('currentDay');
        user.markModified('previousTimes');
        user.save();
      }
    });
});

/* convert time since last wait time update in minutes to display time since update */
function displayTimeSinceUpdate(time) {
  time = Math.floor(time/60000);
  if (time<1) {
    return "< 1 minute ago";
  } else if (time > 60) {
    return "> 1 hour ago";
  } else if (time > 120) {
    return "> 2 hours ago";
  } else {
    return time.toString() + " minutes ago";
  }
}

/* calculate the average wait times per hour for a given day. Input should be an object,
    with hours mapping to arrays of objects. Those objects are minutes mapped to wait time. */
function calculateAverageWait(input, previousTime) {
  if (input[0].length < 1) {
    var temp = {};
    temp[0] = previousTime;
    input[0].push(temp);
  }
  for (var i = 1; i < 24; i++) {
    if (input[i].length < 1) {
      var temp = {};
      var hourLastMinute = Object.keys(input[i-1][input[i-1].length-1])[0];
      var hourLastWaitTime = input[i-1][input[i-1].length-1][hourLastMinute];
      temp[0] = hourLastWaitTime;
      input[i].push(temp);
    }
  }
  var result = {};
  for (var i = 0; i < 24; i++) {
    result[i] = null;
  }
  result[0] = Object.keys(input[0][0])[0]*previousTime;
  for (var i = 0; i < input[0].length-1; i++) {
    var currentMinutes = Object.keys(input[0][i])[0];
    var nextMinutes = Object.keys(input[0][i+1])[0];
    var currentWaitTime = input[0][i][currentMinutes];
    result[0] += (nextMinutes - currentMinutes) * currentWaitTime;
  }
  var zeroLastMinute = Object.keys(input[0][input[0].length-1])[0];
  var zeroLastWaitTime = input[0][input[0].length-1][zeroLastMinute];
  result[0] += (60 - zeroLastMinute)*zeroLastWaitTime;
  result[0] /= 60;
  for (var i = 1; i < 24; i++) {
    var lastHour = Object.keys(input[i-1][input[i-1].length-1])[0];
    var lastWaitTime = input[i-1][input[i-1].length-1][lastHour]; 
    result[i] = Object.keys(input[i][0])[0]*lastWaitTime;
    for (var j = 0; j < input[i].length-1;j++) {
      var currentMinutes = Object.keys(input[i][j])[0];
      var nextMinutes = Object.keys(input[i][j+1])[0];
      var currentWaitTime = input[i][j][currentMinutes];
      result[i] += (nextMinutes - currentMinutes) * currentWaitTime;
    }
    var hourLastMinute = Object.keys(input[i][input[i].length-1])[0];
    var hourLastWaitTime = input[i][input[i].length-1][hourLastMinute];
    result[i] += (60 - hourLastMinute) * hourLastWaitTime;
    result[i] /= 60;
  }
  return result;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  Account.find({}, {_id:false, username: true, waitTime: true, restaurantName: true, timeOfUpdate: true, 
    profilePicture: true, id: true}, function(err, users){
    var usersNew = [];
    for (var user in users) {
      usersNew[user] = {};
      usersNew[user].id = users[user].id;
      usersNew[user].restaurantName = users[user].restaurantName;
      usersNew[user].waitTime = displayTime(users[user].waitTime);
      usersNew[user].timeSinceUpdate = displayTimeSinceUpdate(Date.now()-users[user].timeOfUpdate);
      usersNew[user].profilePicture = users[user].profilePicture;
    }
    if (req.user){
      res.render('index', {isLoggedIn: true, users: usersNew, url: req.user.id});
    }
    else {
      res.render('index', {isLoggedIn: false, users: usersNew});
    }
  }).sort({waitTime:1, timeOfUpdate:-1});
})

/* GET directory page */
router.get('/directory', function(req, res, next) {
  var page = req.query.page; 
  if (page === undefined) {
    page = 1;
  }
  var begin = (page-1)*20;
  var end = page*20;
  var total;
  Account.find({}, {_id:false, username: true, waitTime: true, restaurantName: true, timeOfUpdate: true, 
    profilePicture: true, id: true, restaurantDescription: true, address: true}, function(err, users){
    total = users.length;
    var usersNew = [];
    for (var user in users) {
      if (user >= begin && user < end) {
        usersNew[user] = {};
        usersNew[user].username = users[user].username;
        usersNew[user].id = users[user].id;
        usersNew[user].restaurantName = users[user].restaurantName;
        usersNew[user].waitTime = displayTime(users[user].waitTime);
        usersNew[user].timeSinceUpdate = displayTimeSinceUpdate(Date.now()-users[user].timeOfUpdate);
        usersNew[user].profilePicture = users[user].profilePicture;
        usersNew[user].restaurantDescription = users[user].restaurantDescription;
        usersNew[user].displayAddress = displayAddress(users[user].address);
      }
    }
    begin += 1;
    if (end > total) {
      end = total;
    }
    if (req.user){
      res.render('directory', {isLoggedIn: true, users: usersNew, begin: begin, end: end, total: total,
       Title: "Restaurant Directory", url: req.user.id});
    }
    else {
      res.render('directory', {isLoggedIn: false, begin: begin, end: end, total: total, users:usersNew, Title: "Restaurant Directory"});
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
   res.render('updatewaittime', {isLoggedIn: true, title: 'Update Wait Time', 
    restaurantName: req.user.restaurantName, waitTime: displayTime(req.user.waitTime), 
    timeSinceUpdate: displayTimeSinceUpdate(Date.now()-req.user.timeOfUpdate), url: req.user.id});
  } else {
    res.render('error', {isLoggedIn: false, title: 'Error'});
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
  var query = req.query.search;
  Account.find({'restaurantName': new RegExp('^' + query, "i")}, function(err, users) {
    if (users.length > 0) {
      console.log(users.length);
    } else {
      res.render('noresult');
    }
  });   
  // if (req.user) {
  //  res.render('searchresults', {isLoggedIn: true, title: 'Search Results', url: req.user.id});
  // } else {
  //   res.render('searchresults', {isLoggedIn: false, title: 'Search Results' });
  // }
})

/* POST search autocomplete */
router.post('/search_results', function(req,res) {
  Account.find({}, {_id:true, restaurantName: true, address: true}, function(err, users){
    var usersNew = {}
    for (var user in users) {
      var restaurantName = users[user].restaurantName;
      usersNew[restaurantName] = null;
    }
    res.send(usersNew);
  });
});

/* POST search */
router.post('/search', function(req, res, next) {
  var input = req.body.searchInput;
  Account.findOne({'restaurantName': new RegExp('^' + input + '$', "i")}, function(err, user) {
    if (err) {
      console.log("error");
    } else {
      if (user!=null){
        res.redirect('/users/' + user.id);
      }
      else{
        var page = req.query.page; 
        if (page === undefined) {
          page = 1;
        }
        var begin = (page-1)*20;
        var end = page*20;
        var total;
        Account.find({'restaurantName': new RegExp('^' + input, "i")}, {_id:false, username: true, waitTime: true, restaurantName: true, timeOfUpdate: true, 
          profilePicture: true, id: true, restaurantDescription: true, address: true}, function(err, users){
          total = users.length;
          if (total > 0) {
          var usersNew = [];
          for (var user in users) {
            if (user >= begin && user < end) {
              usersNew[user] = {};
              usersNew[user].username = users[user].username;
              usersNew[user].id = users[user].id;
              usersNew[user].restaurantName = users[user].restaurantName;
              usersNew[user].waitTime = displayTime(users[user].waitTime);
              usersNew[user].timeSinceUpdate = displayTimeSinceUpdate(Date.now()-users[user].timeOfUpdate);
              usersNew[user].profilePicture = users[user].profilePicture;
              usersNew[user].restaurantDescription = users[user].restaurantDescription;
              usersNew[user].displayAddress = displayAddress(users[user].address);
            }
          }
          begin += 1;
          if (end > total) {
            end = total;
          }
          if (req.user){
            res.render('directory', {isLoggedIn: true, users: usersNew, begin: begin, end: end, total: total,
            Title: "Search Results", url: req.user.id});
          }
          else {
            res.render('directory', {isLoggedIn: false, begin: begin, end: end, total: total, users:usersNew, Title: "Search Results"});
          }
          } else {
            res.render('noresult');
          }
        }).sort({waitTime:1, timeOfUpdate:-1});  
      }
    }
  });
});

/* GET signed request for file upload */
router.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  });
  var fileName = req.query['file-name'];
  fileName = uuidV4();
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

/* POST upload file */
router.post('/save-picture', function(req, res) {
  Account.findOne({'username':req.user.username}, function(err,user) {
    if (err) {
      console.log('error');
    } 
    user.profilePicture = req.body.picture;
    user.save();
    res.send("success");
  }) 
});

/* GET logout */
router.get('/logout', function(req, res, next) {
  if (req.user) {
    req.logout();
  }
  res.redirect('/');
})

/* POST bar graph */
router.post('/bar_graph', function(req, res, next) {
  Account.findOne({'restaurantName': req.body.name}, function(err,user){
    if (err) {
      console.log('error');
    }
    res.send(user.previousTimes);
  });
});

/* POST number of directory pages */
router.post('/page_numbers', function(req, res, next) {
  Account.find({}, {_id:true, username: true, waitTime: true, restaurantName: true, timeOfUpdate: true, 
    previousTimes: true, currentDay: true, lastWaitTime: true, id: true}, function(err, users){
      res.send({length: users.length});
  });
});

/* POST wait time */
router.post('/waittime', function(req, res, next) {
  Account.findOne({'username': req.user.username}, function(err, user) {
    if (err) {
      console.log('error');
    }
    user.waitTime = req.body.time;
    user.timeOfUpdate = req.body.timeOfUpdate;
    var time = user.waitTime;
    if (time === 999 || time === 240) {
      time = 0;
    }
    var currentDate = new Date();
    //var dayOfWeek = currentDate.getDay();
    var hour = currentDate.getHours();
    var minutes = currentDate.getMinutes();  
    var temp = {};
    temp[minutes] = time;
    user.currentDay[hour].push(temp);
    user.markModified('currentDay');
    user.save();
    res.send("success");
  });
});

/* POST add user */
router.post('/adduser', function(req, res, next) {
  Account.findOne({'username': req.body.username}, function(err, user) {
    if (user != null) {
      res.render('signuperror');
    } else {
      Account.register(new Account({ username : req.body.username}), req.body.password, function(err, account) {
        if (err) {
            console.log("error", err);
            return res.render('index', { account : account });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/editprofileview');
        });
        account.waitTime=240;
        
        account.id = uuidV4();
        account.restaurantName = req.body.restaurantName;
        account.timeOfUpdate = Date.now();
        account.restaurantDescription = "";
        account.address = {"Street": "", "City": "", "State": "", "Zip": ""};
        
        var ppArray = ['ramen.jpg', 'burger.jpg', 'sandwich.jpg', 'strawberries.jpg', 'cookies3.jpg'];
        var pp = ppArray[Math.floor(Math.random() * ppArray.length)]; 
        account.profilePicture = '../images/'+pp;
        
        account.lastWaitTime = 0;
        account.currentDay = {};
        for (var i = 0; i < 24; i++) {
          account.currentDay[i] = [];
        }
        account.previousTimes = {};
        for (var i = 0; i < 7; i++) {
          account.previousTimes[i] = {};
          for (var j = 0; j < 24; j++) {
            account.previousTimes[i][j] = null;
          }
        }
        account.save();
      });
    }
  });  
});


/* GET about page */
router.get('/editprofileview', function(req, res, next) {
  if (req.user) {
   res.render('editprofileview', {isLoggedIn: true, title: 'Edit Profile View', url: req.user.id});
  } else {
    res.render('error', {isLoggedIn: false, title: 'Edit Profile View' });
  }
})

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

/* POST edit profile */
router.post('/editProfile', function(req, res, next) {
  Account.findOne({'username': req.user.username}, function(err, user) {
    if (err) {
      console.log('error');
    }
    user.restaurantDescription = req.body.restaurantDescription;
    user.address["Street"] = req.body.streetAddress;
    user.address["City"] = req.body.city;
    user.address["State"] = req.body.state;
    user.address["Zip"] = req.body.zip;
    user.markModified('address');
    user.save();
    res.redirect('/users/' + req.user.id);
  });
});

/* POST get map location */
router.post('/map_location', function(req, res, next) {
  var userID = req.body.id;
  Account.findOne({'id': userID}, function(err, user) {
    res.send(displayAddress(user.address));
  });
});

/* GET individual restaurant profile page */
router.get('/users/:id', function(req,res,next) {
  var id = req.params.id;
  var currentUser = false;
  if (req.user) {
    if (req.user.id === id) {
      currentUser = true;
    }
  }
  if (req.user) {
    Account.findOne({'id': id}, function(err, user) {
      try {
        var address = displayAddress(user.address);
        var hasAddress = true;
        if (address === "") {
          hasAddress = false;
        }
        if (err) {
          console.log('error');
        } else {
          if (currentUser) {
            if (hasAddress) {
              res.render('profile', {isLoggedIn: true, currentUser: true, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
                title: user.restaurantName, timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), 
                restaurantDescription: user.restaurantDescription, url: req.user.id, photo: user.profilePicture,
                streetAddress: user.address["Street"], city: user.address["City"], 
                state: user.address["State"], zip: user.address["Zip"], address: address, userID: user.id,
                hasAddress: true, header: "Your Profile"});
            } else {
              res.render('profile', {isLoggedIn: true, currentUser: true, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
                title: user.restaurantName, timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), 
                restaurantDescription: user.restaurantDescription, url: req.user.id, photo: user.profilePicture,
                streetAddress: user.address["Street"], city: user.address["City"], hasAddress: false,
                state: user.address["State"], zip: user.address["Zip"], address: address, userID: user.id, header: "Your Profile"});
            }
          } else {
            if (hasAddress) {
              res.render('profile', {isLoggedIn: true, currentUser: false, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
                title: user.restaurantName, timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), 
                restaurantDescription: user.restaurantDescription, url: req.user.id, photo: user.profilePicture,
                address: address, userID: user.id, hasAddress: true, header: user.restaurantName});
            } else {
              res.render('profile', {isLoggedIn: true, currentUser: false, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
                title: user.restaurantName, timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), 
                restaurantDescription: user.restaurantDescription, url: req.user.id, photo: user.profilePicture,
                address: address, userID: user.id, hasAddress: false, header: user.restaurantName});
            }
          }
          
        }
      } catch (err) {
        res.render('/directory');
      }
    });
  } else {
    Account.findOne({'id': id}, function(err, user) {
      try {
        var address = displayAddress(user.address);
        var hasAddress = true;
        if (address.length === 0) {
          hasAddress = false;
        }
        if (err) {
          console.log('error');
        } else {
          if (hasAddress) {
            res.render('profile', {isLoggedIn: false, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
              timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), photo: user.profilePicture, 
              restaurantDescription: user.restaurantDescription, title: user.restaurantName, address: address,
              userID: user.id, hasAddress: true, header: user.restaurantName});
          } else {
            res.render('profile', {isLoggedIn: false, restaurantName: user.restaurantName, waitTime: displayTime(user.waitTime), 
              timeSinceUpdate: displayTimeSinceUpdate(Date.now()-user.timeOfUpdate), photo: user.profilePicture, 
              restaurantDescription: user.restaurantDescription, title: user.restaurantName, address: address,
              userID: user.id, hasAddress: false, header: user.restaurantName});
          }
        }
      } catch (err) {
        res.redirect('/directory');
      }
    });
  }
});

module.exports = router;

// var input2 = { '0': [{ '3': 10 }, {'30':30}],
  // '1': [{ '3': 10 }],
  // '2': [{ '3': 10 }],
  // '3': [{ '3': 10 }],
  // '4': [{ '3': 10 }],
  // '5': [{ '3': 10 }],
  // '6': [{ '3': 10 }],
  // '7': [{ '3': 10 }],
  // '8': [{ '3': 10 }],
  // '9': [{ '3': 10 }, {'20':20}],
  // '10': [{ '3': 10 }],
  // '11': [{ '3': 10 }],
  // '12': [{ '3': 10 }],
  // '13': [{ '3': 10 }],
  // '14': [{ '3': 10 }],
  // '15': [{ '3': 10 }],
  // '16': [ { '3': 10 } ],
  // '17': [{ '3': 10 }, {'35':30}],
  // '18': [{ '3': 10 }],
  // '19': [{ '3': 10 }],
  // '20': [{ '3': 10 }],
  // '21': [{ '3': 10 }],
  // '22': [{ '3': 10 }],
  // '23': [{ '3': 10 }] };
  // var input = { '0': [],
  // '1': [],
  // '2': [],
  // '3': [],
  // '4': [],
  // '5': [],
  // '6': [],
  // '7': [],
  // '8': [],
  // '9': [],
  // '10': [],
  // '11': [],
  // '12': [],
  // '13': [],
  // '14': [],
  // '15': [],
  // '16': [],
  // '17': [ { '46': 10 } ],
  // '18': [],
  // '19': [],
  // '20': [],
  // '21': [],
  // '22': [],
  // '23': [] }
  // var output = calculateAverageWait(input,20);
  // console.log(output);
