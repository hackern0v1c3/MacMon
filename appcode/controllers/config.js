"use strict";

//Import modules
const fs = require('fs');
const path = require('path');

//Read config from disk at startup
var config = require('../private/config.json');

module.exports.settings = {

  //Return a copy of all settings
  returnAllSettings: function(cb) {
    var runningConfig = JSON.parse(JSON.stringify(config));

		return cb(null,runningConfig);
  },
  
  //Save new config
  saveNewSettings: function(newConfig, cb) {
    var configFileName = path.join(__dirname, '..', 'private', 'config.json');

    fs.writeFile(configFileName, JSON.stringify(newConfig, null, 2), 'utf8', function (err) {
      if (err) {
        return cb(err);
      } else {
        config = newConfig;
        return cb(null);
      }
    });
	}
}