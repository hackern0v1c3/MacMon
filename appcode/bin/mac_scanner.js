#!/usr/bin/env node
////REMEMBER TO TAKE ALL OF THE CONSOLE LOGGING OUT OF HERE
////I have tested the ideal working scenario but not all of the possible failures
////Error handeling and logging needs to be worked on.
"use strict";

//Check if sudo.  This script only works if you run as sudo because arp-scan requires it.

//import winston logger
const logger = require('../controllers/logger.js');

//Import mailer module
const mailer = require('../controllers/mailer');

//Import database module
const db = require('../controllers/db.js');

//Import config for subnets
const config = require('../controllers/config.js');

//Import https for macvendor api
const fetch = require("node-fetch");

//For comparing arrays
Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

//For making arrays unique
Array.prototype.unique = function() {
  return [...(new Set(this))];
}

//For grouping assets by MAC address.  These loops are ugly but work.  There is probably a more clever way to do this.
function groupByMac(addressArray) {
  var groupedArray = []
  //Loop through array of assets
  for (var i=0; i < addressArray.length; i++) {
    var contains = false;
    //Get rid of (DUP) label that is added to some vendors
    addressArray[i].Vendor = addressArray[i].Vendor.split("(DUP")[0]
    //Loop through items that have already been grouped
    for (var j=0; j < groupedArray.length; j++){
      //If a Mac already exists in the grouped set...
      if (groupedArray[j].MAC == addressArray[i].MAC) {
        var contains = true;
        //Push the IP address to thr grouped object
        groupedArray[j].IP.push(addressArray[i].IP[0]);
        //Remove dupliacte IP addresses
        groupedArray[j].IP = groupedArray[j].IP.unique();
        break;
      }
    }
    if (!contains) {
      groupedArray.push(addressArray[i]);
    }
  }
  return groupedArray
}

//Define scanning promise
function getScanResults(cidr){
  return new Promise(function(resolve, reject){
    logger.info('Staring arp-scan for %s', cidr);
    const { exec } = require('child_process');
    exec('arp-scan '+cidr, (err, stdout, stderr) => { 
      logger.info('Completed arp-scan for %s', cidr);
      if (err) {
        reject(Error(err));
      }
      else if (stderr) {
        reject(Error(stderr));
      }
      else {
        resolve(stdout);
      }
    });
  });
}

//Promise to return cidr ranges from config
function getCidrRangesFromController() {
  return new Promise(function(resolve, reject){
    config.settings.returnAllSettings(function(err, settings){
      resolve(settings.CidrRanges);
    });
  });
}

//Promise to resolve vendors using macvendor.com
var getVendorsFromApi = function getVendors(asset) {
  return new Promise(function(resolve, reject) {
    if (asset.Vendor.includes("(Unknown)")) {
      var url = "https://api.macvendors.com/"+asset.MAC;

      logger.info("Going to fetch this url: " + url);

      fetch(url)
        .then(function (res) {
            logger.info("Vendor retrieved for asset " +asset.MAC);
            return res.text();
        })
        .then(function(resText){
          logger.debug("Text for " + asset.MAC + " Vendor: " + resText.trim());
          asset.Vendor = resText.trim();
          resolve(asset);
        })
        .catch(error => {
          logger.error("Error fetching vendor from macvendors.com: " + error);
          asset.Vendor = ('Vendor not found');
          resolve(asset);
        });
    } 
    else {
      logger.debug("Already know vendor for "+ asset.MAC +": " + asset.Vendor);
      resolve(asset);
    }
  });
}

//Setup promise that should return an array of objects.  Each object should have a MAC,IP, and Vendor property.  These represent the results of arp-scan agains all cidr networks in config.js
var returnNetworkAssets = new Promise(function(resolve, reject){
  //Setup scanning promises for all network ranges
  var CidrRangePromise = getCidrRangesFromController();
  CidrRangePromise.then(function(result){
    var promises = result.map(function(cidr){
      return getScanResults(cidr);
    });
      
    //Execute promises and get results of scans
    Promise.all(promises)
      .then(function(data){
        logger.info('Completed all arp scans');
        var  combinedResults = []
  
        for (var i=0; i < data.length; i++){
          var linesFromScan = data[i].split("\n");
  
          for (var j = 2; j < (linesFromScan.length - 4); j++) { 
            var splitLines = linesFromScan[j].split('\t')
            var assetObject = {}
            assetObject.MAC = splitLines[1]
            assetObject.IP = []
            assetObject.IP.push(splitLines[0])
            assetObject.Vendor = splitLines[2]
            combinedResults.push(assetObject)
          }
        }
        logger.info('Organized scan results');
        resolve(groupByMac(combinedResults));
      })
      .catch(function (error){
        logger.error('Error while fetching scan results:');
        logger.debug(error);
        reject(Error(error));
      });
  });
});


//Setup Promise that should return all MAC addresses from the database
var getMacsFromDatabase = new Promise(function(resolve, reject){
  logger.info("About to request MAC addresses from database");
  db.assets.returnAllMacs(function(err, results, fields) {
    if(!err){
      var databaseMacAddresses = []

      for (var i=0; i < results.length; i++){
        databaseMacAddresses.push(results[i].MAC);
      }
      logger.info("Succesfully fetched MAC addresses from database");
      resolve(databaseMacAddresses);
    } else {
      reject(Error(err));
    }
  });
});

//Scan network and query database.  Then compare results
function checkScanAndCheckDatabase(cb) {
  Promise.all([returnNetworkAssets, getMacsFromDatabase])
    .then(function(data){
      logger.info("All data retrieved.  Comparing results.");
      var scanResults = data[0];
      var databasesAddresses = data[1];

      var newAddresses = []
      for (var i = 0; i < scanResults.length; i++){
        var contains = false;

        for (var j=0; j<databasesAddresses.length; j++){
          if(scanResults[i].MAC == databasesAddresses[j]){
            contains = true;
            break;
          }
        }
        if (!contains){
          newAddresses.push(scanResults[i]);
        }
      }

      //Setup  promises for resolving vendor on all new devices
      var vendorPromises = newAddresses.map(getVendorsFromApi);

      var newAssetsWithVendors = Promise.all(vendorPromises);

      //Resolve all vendor.com promises then return data
      newAssetsWithVendors.then(newAssets =>
        cb(null, scanResults, databasesAddresses, newAssets)
      );
    })
    .catch(function (error){
      cb(error);
    });
}

checkScanAndCheckDatabase(function(err, scanResult, databaseMacAddresses, newAddresses){
  if(!err){
    if (newAddresses.length > 0) {
      logger.info("New addresses detected");
      var body = "New MAC addresses detected on network.\r\n"
      for (var i=0; i < newAddresses.length; i++){
        body +="MAC Address: "+newAddresses[i].MAC+"   "
        body +="IP Address: "+newAddresses[i].IP+"   "
        body +="Vendor: "+newAddresses[i].Vendor+"\r\n"
      }
      
      config.settings.returnAllSettings(function(err, settings){
        if (settings.emailNotifications === "True" || settings.emailNotifications === "true") {
          logger.info("Attempting to send email notification");
          mailer.sendMessage("New Devices Detected", body, function(err, message){
            if (!err){
              logger.info("Email sent succesfully");
            } else {
              logger.error("Error sending email notification");
              logger.debug(err);
            }
          });
        } else {
          logger.info("Email notifications are disabled. No email attempted.");
        }
      });
    }
    if (scanResult.length > 0) {
      logger.info("Preparing to upsert assets table");
      db.assets.upsertMany(scanResult, function(err){
        if(!err){
          logger.info("Completed database upsert");
        } else {
          logger.error("Error updating database with scan results");
          logger.debug(err);
        }
        logger.info("Closing database connection");
        db.dbConnection.disconnect(function(){});
        logger.info("Scanner Complete");
      });
    } else {
      logger.info("Closing database connection");
      db.dbConnection.disconnect(function(){});
      logger.info("Scanner Complete");
    }
  } else {
    logger.error("Error in scanning module retrieving or comparing arp-scan and database MAC addresses");
    logger.debug("%s", err);
  }
});
