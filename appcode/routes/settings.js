const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const db = require('../controllers/db.js');
const validateSettings = require('../validators/settings.js');
let config = require('../controllers/config.js');

/* GET settings page without passwords. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    config.settings.returnAllSettings(function(err, settings){
      if (err){
        logger.error(`Error reading config file: ${err}`);
        res.status(500).send('Internal server error: Error reading config file');
      } else {
        delete settings.emailSenderPassword;
        db.assetTypes.returnAllAssetTypes(function(err, results, fields){
          if(err){
            logger.error(`Error fetching asset types from database: ${err}`);
            res.status(500).send('Internal server error: Error fetching asset types');
          } else{
            res.render('settings', { username: req.user.userName, conf: settings, assetTypes: results, csrfToken: req.csrfToken() });
          }          
        });  
      }
    });
  }
});

/* POST for updating config without editing passwords */
router.post('/', user.can('update data'), function(req, res) {
  const validationError = validateSettings(req.body);
  if ( validationError != null){
    logger.debug(`Settings validation failed: ${validationError}`);
    return res.status(422).send('Improperly Formed Settings');
  }

  config.settings.returnAllSettings(function(err, settings){
    if (err){
      logger.error(`Error reading config file: ${err}`);
      res.status(500).send('Internal server error: Error reading config file');
    }

    //Keep email password from old config if no new one is supplied
    if(typeof req.body.emailSenderPassword === "undefined"){
      req.body.emailSenderPassword = settings.emailSenderPassword;
    } 

    config.settings.saveNewSettings(req.body, function(err){
      if (err){
        logger.error(`Error writing config file: ${err}`);
        res.status(500).send('Internal server error: Error saving config file');
      }
      logger.info('Wrote new config to disk');
      res.status(200).send();
    });
  });
});

module.exports = router;