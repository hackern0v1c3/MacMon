var express = require('express');
var router = express.Router();

/* GET home page. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    res.render('index', { title: 'Express', username: req.user.userName });
  }
});

module.exports = router;
