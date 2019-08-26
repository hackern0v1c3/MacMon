const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const validatePasswordReset = require('../validators/password_reset.js');

/* POST for restting user passwords */
router.post('/', function(req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    const validationError = validatePasswordReset(req.body.password, req.body.confirmPassword);
    if ( validationError != null){
      logger.debug(`Password validation failed: ${validationError}`);
      return res.status(422).send('Invalid password reset request');
    }

    db.users.updatePassword(req.user.userName, req.body.password, function(err) {
      if(!err) {
        logger.debug(`Password reset for ${req.user.userName}`);
        res.redirect('/logout');
      } else {
        logger.error(`Error updating database: ${err}`);
        res.status(500).send('Internal server error: Error updating data');
      }
    });
  }
});

module.exports = router;