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
  logger.info('mysqldump completed');
  if (err) {
    logger.error('Error: %s', err);
    process.exit(1);
  }
  else if (stderr) {
    logger.error('Error: %s', stderr);
    process.exit(1);
  }
  else {
    logger.info('Backup complete');
  }
});
