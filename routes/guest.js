const express = require('express');
const router = express.Router();
const db = require('../private/db.js');

/* GET home page. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    db.assets.returnGuestAssets(function(err, results, fields){
      if(!err){
        res.render('pending', { title: 'Express', username: req.user.userName, assets: results })
      } else {
        res.send('Internal server error: Error retrieving data', 500);
      }
    });
  }
});

module.exports = router;
