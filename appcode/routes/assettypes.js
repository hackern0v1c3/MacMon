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
      logger.debug(`Error retrieving asset types from database: ${err}`);
      res.status(500).send('Internal server error: Error retrieving data');
    }
  });
});

module.exports = router;