const express = require('express');
const router = express.Router();

var config = require('../private/config.json');

/* GET home page. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    res.render('settings', { username: req.user.userName, conf: config});
  }
});

module.exports = router;
