const express = require('express');
const router = express.Router();
const db = require('../controllers/db.js');

/* GET home page. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    db.assets.returnApprovedAssets(function(err, results, fields){
      if(!err){
        res.render('index', { username: req.user.userName, assets: results })
      } else {
        res.status(500).send('Internal server error: Error retrieving data');
      }
    });
  }
});

module.exports = router;
