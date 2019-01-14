"use strict";
//Sets up a reusable winston logger for the rest of the application.  It reads the log level from the environmental variable LOG_LEVEL.
const { createLogger, format, transports } = require("winston");

var logLevel = 'error';

if (process.env.LOG_LEVEL === 'development'){
  var logLevel = 'debug';
}

const level = logLevel;

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
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