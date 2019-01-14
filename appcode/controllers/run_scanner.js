"use strict";

const { exec } = require('child_process');
const logger = require('./logger.js');

exports.runOnce = function() {
	try{
    exec(__dirname + '/../bin/mac_scanner.js', (err, stdout, stderr) => { 
      if (err) {
        logger.error('Error launching scanner');
        logger.debug(err);
      }
      else if (stderr) {
        logger.error('Arpscan error');
        logger.debug('Arpscan error: %s', stderr);
      }
      else {
        logger.info(stdout);
        logger.debug('Done scanning');
      }
    });
  }
  catch(err){
    logger.error('Error setting timer for network scans');
    logger.debug('Error in network_scanner.js: %s', err);
  }
};