const express = require('express');
const router = express.Router();
const passport = require('passport');

/* GET login for authentication */
router.get('/', function(req, res, next) {
  res.render('login');
});

/* POST login for authentication */
router.post('/', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }), function(req, res, next) {
  
});

module.exports = router;
