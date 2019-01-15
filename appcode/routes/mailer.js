const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const mailer = require('../controllers/mailer.js');

/* GET request to send test email */
//Redirect if not logged in
router.get('/', function (req, res) {
  if (!req.user) {
    res.status(401).send('Please log in to send test emails');
  } else {
    logger.info("Attempting to send test email");
    mailer.sendMessage("MacMon Email Test", "This is a test email from MacMon.  Your email settings are correct.", function(err, message){
      if (!err){
        logger.info("Test email sent succesfully");
        res.status(200).send("Test email sent succesfully.");
      } else {
        logger.error("Error sending test email");
        logger.debug(`${err}`);
        res.status(500).send(`Test email failed: ${err}`);
      }
    });
  }
});

module.exports = router;