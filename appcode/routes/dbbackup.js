const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const db = require('../controllers/db.js');

/* POST for requesting database backup or restore*/
router.post('/', user.can('be admin'), function(req, res) {
  switch(req.body.action) {
    case "backup":
      logger.info("Backup request received");
      db.backup.newBackup(function(err){
        if(!err){
          res.status(200).send();
        } else {
          logger.debug('Error backing up database: %s', err);
          res.status(500).send('Internal server error: Error backing up database');
        }
      });      
      break;
    case "restore":
      break;
    default:
      logger.debug('Invalid backup action requested: %s', req.body.action);
      res.status(500).send('Internal server error: Unknown dbbackup action: %s', req.body.action);
  }
});

module.exports = router;