"use strict";
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const logger = require('./logger.js');

//Exports backup utilities
module.exports.utils = {
  //For creating a new backup
	newBackup: function(cb) {
		var d = new Date();
		var filename = 'backup.' + formatDate(d) + '.sql'
		var backupFileName = path.join(__dirname, '..', 'private', 'backups', filename);

		try{
      exec('mysqldump -u'+process.env.DB_USER+' -p'+process.env.DB_PASSWORD+' '+process.env.DB_NAME+' --single-transaction >'+backupFileName, (err, stdout, stderr) => {
        logger.info("mysql dump complete");
        exec('wc -l <'+ backupFileName, function (error, results) {
          logger.info("mysqldump file is %s lines long", results);
          if (results > 10) {
            return cb(null);
          } 
          else {
            logger.debug("error: %s", error);
            return cb("Backup failed");
          }    
        });
      });
		}
		catch(err){
			return cb(err);
		}
  },
  
  //For retrieving a list of backups files
  getBackupFileList: function(cb) {
    var backupFolder = path.join(__dirname, '..', 'private', 'backups');

    fs.readdir(backupFolder, function(err, files){
      if (!err){
        files.reverse();
        cb(null, files);
      } else {
        cb(err, null);
      }
    });
  }
}

/* For formatting date to include in backup file names */
function formatDate(date) {
  return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('-') + ':' +
      [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
}