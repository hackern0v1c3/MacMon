const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');

/* Routes for Asset Operations */
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

<<<<<<< HEAD
/* POST login for authentication */
=======
/* POST for updating data */
>>>>>>> node_branch
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

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> node_branch
