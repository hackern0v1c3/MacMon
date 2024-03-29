"use strict";

const { spawn } = require('child_process');
const logger = require('./logger.js');

var blockedDevices = [];

exports.toggleBlocking = function(ipAddress) {
  logger.debug(`Blocker toggle request received for: ${ipAddress}`);

  //If IP is already in blockedAssets
  var indexOfDevice = blockedDevices.findIndex(x => x.name == ipAddress);
  if (indexOfDevice > -1) {
    blockedDevices[indexOfDevice].childProcess.kill();
    blockedDevices.splice(indexOfDevice, 1);
  } else {
    var newChildProcessHolder = {};
    newChildProcessHolder.name = ipAddress;
    newChildProcessHolder.childProcess = spawn('/usr/src/app/bin/dos', ['-t', ipAddress]);

    blockedDevices.push(newChildProcessHolder);
  }
};

exports.getBlockedDevices = function(){
  return blockedDevices;
};