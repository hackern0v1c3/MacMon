const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');
const logger = require('../controllers/logger.js');
const mailer = require('../controllers/mailer.js');
const validateEmailTest = require('../validators/email_test.js');

/* POST request to send test email */
//Redirect if not logged in
router.post('/', function (req, res) {
  if (!req.user) {
    res.status(401).send('Please log in to send test emails');
  } else {
    const validationError = validateEmailTest(req.body);
    if ( validationError != null){
      logger.debug(`Email test settings validation failed: ${validationError}`);
      return res.status(422).send('Improperly Formed Email Test Settings');
    }
    
    logger.info("Attempting to send test email");
    mailer.testSendMessage(req.body, function(err, result){
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