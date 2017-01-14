var express = require('express');
var router = express.Router();

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

module.exports = router;
