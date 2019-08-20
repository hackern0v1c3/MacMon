const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const validateInt = require('../validators/int.js');
const validateAssetType = require('../validators/asset_type.js');

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
  const validationError = validateInt(req.params.ID);
  if ( validationError != null){
    logger.debug(`ID validation failed: ${validationError}`);
    return res.status(422).send('Improperly Formed ID');
  }

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
  const validationError = validateAssetType(req.body);
  if ( validationError != null){
    logger.debug(`Received assettype object: ${req.body}`);
    logger.debug(`AssetType validation failed: ${validationError}`);
    return res.status(422).send('Improperly Formed Asset Type Data');
  }

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