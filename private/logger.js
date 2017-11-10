"use strict";
//Read config file
const config = require('../private/config.js');

//Sets up a reusable winston logger for the rest of the application.  It reads the log level from the "environment" value in config.
const winston = require("winston");

var logLevel = 'error';

if (config.environment === 'development'){
  var logLevel = 'debug';
}

const level = logLevel;

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: level,
            timestamp: function () {
                return (new Date()).toISOString();
            }
        })
    ]
});

module.exports = logger

module.exports.stream = {
  write: function(message, encoding){
      logger.info(message);
  }
};