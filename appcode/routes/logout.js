const express = require('express');
const router = express.Router();

/* GET logout request. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (req.user) {
    req.logout();
  }
  res.redirect('/login');
});

module.exports = router;
