"use strict";

const { exec } = require('child_process');
const logger = require('./logger.js');

exports.runOnce = function(mac, ip) {
  try{
    logger.info("Attempting to start nmap scan");
    exec(__dirname + '/../bin/nmap_scanner.js '+ mac + " " + ip, (err, stdout, stderr) => { 
      if (err) {
        logger.error('Error launching nmap scanner');
        logger.debug(err);
      }
      else if (stderr) {
        logger.error('nmap error');
        logger.debug(`Nmap error: ${stderr}`);
      }
      else {
        logger.info(stdout);
        logger.debug('Done running nmap scan');
      }
    });
  }
  catch(err){
    logger.error('Error running nmap_scanner');
    logger.debug(`Error in nmap_scanner.js: ${err}`);
  }
}