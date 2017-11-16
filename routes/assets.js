const express = require('express');
const router = express.Router();
const db = require('../private/db.js');
const user = require('../private/roles.js');

/* Routes for Asset Operations */
//For approving a MAC address
router.get('/approve/:MAC', user.can('update data'), function (req, res) {
  db.assets.approveAsset(req.params.MAC, function(err){
    if(!err){
      res.send('MAC Approved', 200);
    } else {
      res.send('Internal server error: Error updating data', 500);
    }
  });
});


module.exports = router;
