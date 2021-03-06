#!/usr/bin/env node

"use strict";

const { exec } = require('child_process');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const logger = require('../controllers/logger.js');
const db = require('../controllers/db.js');
const utils = require('../controllers/utils.js');

if (process.argv.length < 4) {
  console.log("Usage: " + process.argv[1] + " mac ip");
  console.log("Example: " + process.argv[1] + " xx:xx:xx:xx:xx:xx 192.168.1.1");
  process.exit(0);
}

const mac = process.argv[2];
const ip = process.argv[3];

if (!utils.validateMac(mac)) {
  logger.error(`Invalid mac address: ${mac}`);
  process.exit(1);
}

if (!utils.validateIPaddress(ip)) {
  logger.error(`Invalid ip address: ${ip}`);
  process.exit(1);
}

logger.info(`Running nmap scan of: ${ip}`);

exec('nmap -Pn -n -p1-65535 -sV '+ ip + ' -oX -', (err, stdout, stderr) => {
  logger.info(`Completed nmap for ${ip}`);
  if (err) {
    logger.error(`Error: ${err}`);
    process.exit(1);
  }
  else if (stderr) {
    logger.error(`Error: ${stderr}`);
    process.exit(1);
  }
  else {
    logger.info('Nmap Result');

    parser.parseString(stdout, function (err, result) {
      //crashes if host is down
      var ports = result.nmaprun.host[0].ports[0].port;
      var d = new Date();
      var portInfo = d + "\r\n"

      ports.forEach(function(port) {
        portInfo += "Port " + port.$.portid + ": "
        portInfo += port.state[0].$.state

        if (typeof port.service != "undefined"){
          portInfo += "\r\n  Name: " + port.service[0].$.name
          portInfo += "\r\n  Product: " + port.service[0].$.product

          if (typeof port.service[0].$.version != "undefined"){
            portInfo += "\r\n  Version: " + port.service[0].$.version
          }
          if (typeof port.service[0].$.ostype != "undefined"){
            portInfo += "\r\n  OsType: " + port.service[0].$.ostype
          }
        }

        portInfo += "\r\n"
      });

      db.assets.updateNmap(mac, portInfo, function(err){
        if (err) {
          logger.error(`Error updating database with nmap data: ${mac} ${ip}`);
          logger.error(`Nmap scanner debug: ${err}`);
        }
        else {
          logger.info(`Database Nmap Update Complete for ${mac} ${ip}`);
        }
        logger.info("Closing database connection");
        db.dbConnection.disconnect(function(){});
        logger.info("Scanner Complete");
      });
    });
  }
});
