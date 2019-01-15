const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');

/* POST for restting user passwords */
router.post('/', function(req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    db.users.updatePassword(req.user.userName, req.body.password, function(err) {
      if(!err) {
        logger.debug(`Password reset for ${req.user.userName}`);
        res.redirect('/logout');
      } else {
        logger.debug(`Error updating database: ${err}`);
        res.status(500).send('Internal server error: Error updating data');
      }
    });
  }
});

module.exports = router;