const express = require('express');
const router = express.Router();

/* GET home page. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    res.render('pending', { title: 'Express', username: req.user.userName });
  }
});

module.exports = router;
