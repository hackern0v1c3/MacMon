const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const utils = require('../controllers/utils.js');
const run_nmap = require('../controllers/run_nmap.js');
var blocker = require('../controllers/run_blocker.js');

/* Routes for Asset Operations */
//For retrieving an asset by MAC address
router.get('/:MAC', user.can('read data'), function (req, res) {
  db.assets.returnAsset(req.params.MAC, function(err, asset){
    if(!err){
      res.status(200).send(asset);
    } else {
      logger.error(`Error retrieving asset from database: ${err}`);
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
      logger.error(`Error updating database: ${err}`);
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
      logger.error(`Error updating database: ${err}`);
      res.status(500).send('Internal server error: Error updating data');
    }
  });
});

//For toggling blocking a device on the network by IP Address
router.get('/block/:IpAddress', user.can('write data'), function (req, res) {

  //Validate that the IP address is legitimate
  if (utils.validateIPaddress(req.params.IpAddress)) {
    blocker.toggleBlocking(req.params.IpAddress);
    res.status(200).send();
  } else {
    logger.debug(`Tried to block invalid IP address: ${req.params.IpAddress}`);
    res.status(500).send('Internal server error: Invalid IP Address');
  }
});

/* POST for updating data */
router.post('/update', user.can('update data'), function(req, res) {
  db.assets.updateAsset(req.body, function(err){
    if(!err){
      res.status(200).send('MAC Updated');
    } else {
      logger.error(`Error updating database: ${err}`);
      res.status(500).send('Internal server error: Error updating data');
    }
  });
});

//Post for starting a nmap scan
router.post('/scan', user.can('update data'), function(req, res) {
  run_nmap.runOnce(req.body.MAC, req.body.IP);
  res.status(200).send();
});

module.exports = router;