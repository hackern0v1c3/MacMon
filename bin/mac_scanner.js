#!/usr/bin/env node

//Check if sudo

//For comparing arrays
Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

//Import database module
var db = require('../private/db.js');

//Setup Promise
var getMacFromDatabase = new Promise(function(resolve, reject){
  db.assets.returnAllMac(function(err, results, fields) {
    db.dbConnection.disconnect(function(){});
    if(!err){
      resolve(results);
    } else {
      reject(Error(err));
    }
  });
});


var checkForNewMacs = function () {
  getMacFromDatabase
    .then(function (fulfilled) {
      const { exec } = require('child_process');
      exec('arp-scan 192.168.1.0/24', (err, stdout, stderr) => { //make this not a static network range
        if (err) {
          console.log("error: " + err);
        }
        else if (stderr) {
          console.log(`stderr: ${stderr}`);
        }
        else {
          linesFromScan = stdout.split('\n')
          addressesFromScan = []
          uniqueAddressesFromDatabase = []
          for (i = 2; i < (linesFromScan.length - 4); i++) { 
            addressesFromScan.push(linesFromScan[i].split('\t')[1])
          }

          uniqueAddressesFromScan = [...new Set(addressesFromScan)]

          for (i = 0; i < fulfilled.length; i++) {
            uniqueAddressesFromDatabase.push(fulfilled[i].MAC);
          }

          console.log("From scan:");
          console.log(uniqueAddressesFromScan);
          console.log("From database:");
          console.log(uniqueAddressesFromDatabase);
          console.log("New detected:");
          console.log(uniqueAddressesFromScan.diff(uniqueAddressesFromDatabase));
        }
      })
    })
    .catch(function (error){
      console.log(error);
    });
};

checkForNewMacs();

//If yes send email

//Batch upsert database

//If error for DB or Email send log