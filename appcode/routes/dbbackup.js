const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const backup = require('../controllers/backup.js');

/* POST for requesting database backup or restore*/
router.post('/', user.can('be admin'), function(req, res) {
  switch(req.body.action) {
    case "backup":
      logger.info("Backup request received");
      backup.utils.newBackup(function(err){
        if(!err){
          res.status(200).send();
        } else {
          logger.error(`Error backing up database: ${err}`);
          res.status(500).send('Internal server error: Error backing up database');
        }
      });      
      break;
    case "restore":
      logger.info(`Database restore request received.  Filename: ${req.body.filename}`);
      backup.utils.restoreDatabase(req.body.filename, function(err){
        if (!err){
          res.status(200).send();
        } else {
          logger.error(`Error restoring database: ${err}`);
          res.status(500).send('Internal server error: Error restoring database');
        }
      });
      break;
    case "getfilelist":
      logger.info("Backup file list request received");
      
      backup.utils.getBackupFileList(function(err, data){
        if(!err){
          res.status(200).send(data);
        } else {
          logger.error(`Error retrieving backup file list: ${err}`);
          res.status(500).send('Internal server error: Error retrieving backup file list');
        }
      });
      
      break;
    default:
      logger.error(`Invalid backup action requested: ${req.body.action}`);
      res.status(500).send(`Internal server error: Unknown dbbackup action: ${req.body.action}`);
  }
});

module.exports = router;