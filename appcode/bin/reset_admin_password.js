#!/usr/bin/env node
const logger = require('../controllers/logger.js');
const db = require('../controllers/db.js');

db.users.updatePassword('admin', 'admin', function(err){
  if (err) {
    logger.error('Could not update admin password in database');
    logger.debug(`Password Reset Error: ${err}`);
  } else {
    logger.debug('admin password has been reset to admin.');
  }

  db.dbConnection.disconnect(function(){});
});