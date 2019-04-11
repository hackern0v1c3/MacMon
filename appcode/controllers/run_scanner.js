"use strict";

const { exec } = require('child_process');
const logger = require('./logger.js');

exports.runOnce = function() {
	try{
    exec(__dirname + '/../bin/mac_scanner.js', (err, stdout, stderr) => { 
      if (err) {
        logger.error('Error launching scanner');
        logger.error(err);
      }
      else if (stderr) {
        logger.error('Arpscan error');
        logger.error(`Arpscan error: ${stderr}`);
      }
      else {
        logger.info(stdout);
        logger.debug('Done scanning');
      }
    });
  }
  catch(err){
    logger.error('Error setting timer for network scans');
    logger.error(`Error in network_scanner.js: ${err}`);
  }
};