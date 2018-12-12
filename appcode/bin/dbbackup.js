#!/usr/bin/env node

"use strict";

const { exec } = require('child_process');
const logger = require('../controllers/logger.js');

if (process.argv.length < 3) {
  console.log("Usage: " + process.argv[1] + " filename");
  console.log("Example: " + process.argv[1] + " backup.sql");
  process.exit(0);
}

const filename = process.argv[2];

logger.info('Running backup to: %s', filename);

exec('mysqldump -u'+process.env.DB_USER+' -p'+process.env.DB_PASSWORD+' '+process.env.DB_NAME+' --single-transaction >'+filename, (err, stdout, stderr) => {
  exec('wc'+ filename, function (error, results) {
    if (results > 10) {
      console.log(results);
    } 
    else {
      process.exit(1);
    }    
  });
});
