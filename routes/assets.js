const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
var blocker = require('../controllers/run_blocker.js');

/* Routes for Asset Operations */
//For retrieving an asset by MAC address
router.get('/:MAC', user.can('read data'), function (req, res) {
  db.assets.returnAsset(req.params.MAC, function(err, asset){
    if(!err){
      res.status(200).send(asset);
    } else {
      logger.debug('Error retrieving asset from database: %s', err);
      res.status(500).send('Internal server error: Error retrieving data');
    }
  });
});

//For approving a MAC address
router.get('/approve/:MAC', user.can('update data'), function (req, res) {
  db.assets.approveAsset(req.params.MAC, function(err){
    if(!err){
      res.status(200).send('MAC Approved');
    } else {
      logger.debug('Error updating database: %s', err);
      res.status(500).send('Internal server error: Error updating data');
    }
  });
});

//For deleting an asset by MAC address
router.get('/delete/:MAC', user.can('delete data'), function (req, res) {
  db.assets.deleteAsset(req.params.MAC, function(err){
    if(!err){
      res.status(200).send('MAC Deleted');
    } else {
      logger.debug('Error updating database: %s', err);
      res.status(500).send('Internal server error: Error updating data');
    }
  });
});

//For toggling blocking a device on the network by IP Address
router.get('/block/:IpAddress', user.can('write data'), function (req, res) {
  blocker.toggleBlocking(req.params.IpAddress);
  res.status(200).send();
});

/* POST for updating data */
router.post('/update', user.can('update data'), function(req, res) {
  db.assets.updateAsset(req.body, function(err){
    if(!err){
      res.status(200).send('MAC Updated');
    } else {
      logger.debug('Error updating database: %s', err);
      res.status(500).send('Internal server error: Error updating data');
    }
  });
});

module.exports = router;