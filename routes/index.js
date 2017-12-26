const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');
var blocker = require('../controllers/run_blocker.js');

/* GET home page. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    db.assets.returnApprovedAssets(function(err, results, fields){
      if(!err){
        var blockedDevices = blocker.getBlockedDevices();

        var resultsIncludingBlocks = results.map(function cb(eachResult) {
          var indexOfDevice = blockedDevices.findIndex(x => x.name == eachResult.IP);
          if (indexOfDevice > -1) {
            eachResult.blocked = true;
          } else {
            eachResult.blocked = false;
          }
          return eachResult;
        });

        res.render('index', { username: req.user.userName, assets: resultsIncludingBlocks })
      } else {
        res.status(500).send('Internal server error: Error retrieving data');
      }
    });
  }
});

module.exports = router;