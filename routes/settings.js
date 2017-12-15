const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const fs = require('fs');
const path = require('path');

var config = require('../private/config.json');

/* GET settings page without passwords. */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    delete config.dbPassword;
    delete config.cookieSecret;
    delete config.emailSenderPassword;

    res.render('settings', { username: req.user.userName, conf: config});
  }
});

/* POST for updating config without editing passwords */
router.post('/', user.can('update data'), function(req, res) {
  newConfig = req.body;

  var configFileName = path.join(__dirname, '..', 'private', 'config.json');

  fs.readFile(configFileName, 'utf8', function (err, data) {
    if (err) {
      logger.debug('Error reading config file: %s', err);
      res.status(500).send('Internal server error: Error updating data');
    }

    var oldConfig = JSON.parse(data);
  
    //update any relevant settings
    newConfig.dbPassword = oldConfig.dbPassword;
    newConfig.cookieSecret = oldConfig.cookieSecret;
    newConfig.emailSenderPassword = oldConfig.emailSenderPassword;
    newConfig.environment = oldConfig.environment;

    //write file async
    fs.writeFile(configFileName, JSON.stringify(newConfig, null, 2), 'utf8', function (err) {
      if (err) {
        logger.debug('Error reading config file: %s', err);
        res.status(500).send('Internal server error: Error updating data');
      } else {
        logger.info('Wrote new config to disk');
        res.status(200).send();
      }
    });
  });
});

/* POST for updating database password in config.json */
router.post('/dbPassword', user.can('update data'), function(req, res) {
  newConfig = req.body;

  var configFileName = path.join(__dirname, '..', 'private', 'config.json');

  fs.readFile(configFileName, 'utf8', function (err, data) {
    if (err) {
      logger.debug('Error reading config file: %s', err);
      res.status(500).send('Internal server error: Error updating data');
    }

    var oldConfig = JSON.parse(data);
  
    //update any relevant settings
    oldConfig.dbPassword = newConfig.dbPassword;

    //write file async
    fs.writeFile(configFileName, JSON.stringify(oldConfig, null, 2), 'utf8', function (err) {
      if (err) {
        logger.debug('Error reading config file: %s', err);
        res.status(500).send('Internal server error: Error updating data');
      } else {
        logger.info('Wrote new config to disk');
        res.status(200).send();
      }
    });
  });
});

/* POST for updating email password in config.json */
router.post('/emailPassword', user.can('update data'), function(req, res) {
  newConfig = req.body;

  var configFileName = path.join(__dirname, '..', 'private', 'config.json');

  fs.readFile(configFileName, 'utf8', function (err, data) {
    if (err) {
      logger.debug('Error reading config file: %s', err);
      res.status(500).send('Internal server error: Error updating data');
    }

    var oldConfig = JSON.parse(data);
  
    //update any relevant settings
    oldConfig.emailSenderPassword = newConfig.emailSenderPassword;

    //write file async
    fs.writeFile(configFileName, JSON.stringify(oldConfig, null, 2), 'utf8', function (err) {
      if (err) {
        logger.debug('Error reading config file: %s', err);
        res.status(500).send('Internal server error: Error updating data');
      } else {
        logger.info('Wrote new config to disk');
        res.status(200).send();
      }
    });
  });
});

/* POST for updating cookie signing secret in config.json */
router.post('/cookieSecret', user.can('update data'), function(req, res) {
  newConfig = req.body;

  var configFileName = path.join(__dirname, '..', 'private', 'config.json');

  fs.readFile(configFileName, 'utf8', function (err, data) {
    if (err) {
      logger.debug('Error reading config file: %s', err);
      res.status(500).send('Internal server error: Error updating data');
    }

    var oldConfig = JSON.parse(data);
  
    //update any relevant settings
    oldConfig.cookieSecret = newConfig.cookieSecret;

    //write file async
    fs.writeFile(configFileName, JSON.stringify(oldConfig, null, 2), 'utf8', function (err) {
      if (err) {
        logger.debug('Error reading config file: %s', err);
        res.status(500).send('Internal server error: Error updating data');
      } else {
        logger.info('Wrote new config to disk');
        res.status(200).send();
      }
    });
  });
});

module.exports = router;
