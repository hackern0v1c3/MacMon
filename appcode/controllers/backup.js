"use strict";
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

//Exports backup utilities
module.exports.utils = {
  //For creating a new backup
	newBackup: function(cb) {
		var d = new Date();
		var filename = 'backup.' + formatDate(d) + '.sql'
		var backupFileName = path.join(__dirname, '..', 'private', 'backups', filename);

		try{
			exec(__dirname + '/../bin/dbbackup.js '+ backupFileName, (err, stdout, stderr) => {
				if (stderr) {
					return cb("Backup failed");
				}
				else {
					return cb(null);
				}
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