const express = require('express');
const router = express.Router();
const db = require('../private/db.js');
const user = require('../private/roles.js');
const logger = require('../private/logger.js');

/* Routes for Asset Operations */
//For approving a MAC address
router.get('/approve/:MAC', user.can('update data'), function (req, res) {
  db.assets.approveAsset(req.params.MAC, function(err){
    if(!err){
      res.send('MAC Approved', 200);
    } else {
      logger.debug('Error updating database: %s', err);
      res.send('Internal server error: Error updating data', 500);
    }
  });
});

router.get('/delete/:MAC', user.can('delete data'), function (req, res) {
  db.assets.deleteAsset(req.params.MAC, function(err){
    if(!err){
      res.send('MAC Deleted', 200);
    } else {
      logger.debug('Error updating database: %s', err);
      res.send('Internal server error: Error updating data', 500);
    }
  });
});

/* POST login for authentication */
router.post('/update', user.can('update data'), function(req, res) {
  db.assets.updateAsset(req.body, function(err){
    if(!err){
      res.send('Asset Updated', 200);
    } else {
      logger.debug('Error updating database: %s', err);
      res.send('Internal server error: Error updating data', 500);
    }
  });
});

module.exports = router;
