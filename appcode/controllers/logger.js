"use strict";
//Read config file
const config = require('../private/config.json');

//Sets up a reusable winston logger for the rest of the application.  It reads the log level from the environmental variable LOG_LEVEL.
const { createLogger, transports } = require("winston");

var logLevel = 'error';

if (process.env.LOG_LEVEL === 'development'){
  var logLevel = 'debug';
}

const level = logLevel;

const logger = createLogger({
    transports: [
        new transports.Console({
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