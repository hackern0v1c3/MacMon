const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const mailer = require('../controllers/mailer.js');

/* POST request to send test email */
//Redirect if not logged in
router.post('/', function (req, res) {
  if (!req.user) {
    res.status(401).send('Please log in to send test emails');
  } else {
    var emailSettingsToTest = req.body;

    logger.info("Attempting to send test email");
    mailer.testSendMessage(emailSettingsToTest, function(err, result){
      if (!err){
        logger.info("Test email sent succesfully");
        res.status(200).send("Test email sent succesfully.");
      } else {
        logger.error("Error sending test email");
        logger.error(`${err}`);
        res.status(500).send(`Test email failed: ${err}`);
      }
    });
  }
});

module.exports = router;