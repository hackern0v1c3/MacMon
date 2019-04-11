const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');

/* Routes for Asset Operations */
//For retrieving all asset types
router.get('/', user.can('read data'), function (req, res) {
  db.assetTypes.returnAllAssetTypes(function(err, data){
    if(!err){
      res.status(200).send(data);
    } else {
      logger.error(`Error retrieving asset types from database: ${err}`);
      res.status(500).send('Internal server error: Error retrieving data');
    }
  });
});

//For deleting an asset type
router.get('/delete/:ID', user.can('delete data'), function (req, res) {
  if(req.params.ID === "1"){
    res.status(403).send('Asset type 1 cannot be deleted.  It is a required default.');
  } else {
    db.assetTypes.deleteAssetType(req.params.ID, function(err){
      if(!err){
        res.status(200).send('Asset Type Deleted');
      } else {
        logger.error(`Error updating database: ${err}`);
        res.status(500).send('Internal server error: Error updating data');
      }
    });
  }
});

//For creating a new asset type
/* POST for updating data */
router.post('/', user.can('update data'), function(req, res) {
  db.assetTypes.insertNew(req.body.name, function(err, newid){
    if(!err){
      res.status(200).send(newid);
    } else {
      logger.error(`Error updating database: ${err}`);
      res.status(500).send('Internal server error: Error updating data');
    }
  });
});

module.exports = router;