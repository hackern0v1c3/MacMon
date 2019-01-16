"use strict";

//Import modules
const config = require('./config.js');
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const path = require('path');
const { exec } = require('child_process');

//Setup SQL Server connection
var pool = mysql.createPool({
	host		: process.env.DB_ADDRESS,
	dateStrings: true,
	user		: process.env.DB_USER,
	password	: process.env.DB_PASSWORD,
	database	:  process.env.DB_NAME
});

//Exports a way to gracefully shutdown the database connection
module.exports.dbConnection = {
	disconnect: function(cb) {
		pool.end(function (err) {
			return cb(err);
		});
	}
}

//Export SQL Queries For Assets
module.exports.assets = {

  //Return all Assets assets from database
  returnAllAssets: function(cb) {
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			connection.query('SELECT * from Assets', function(error, results, fields) {
				connection.release();
				if(err){return cb(err, null, null);}
				return cb(null, results, fields);
			});
		});
	},

	//Return one Assets assets from database by MAC address
  returnAsset: function(mac, cb) {

		if (mac === null) {
			return cb('mac cannot be null');
		}
	
		pool.getConnection(function(err, connection) {
			if(err){return cb(err, null);}
		
			connection.query('SELECT * from Assets WHERE MAC = ?', [mac], function (err, results, fields) {
				connection.release();
				if(err){return cb(err, null);}
				
				if (results.length === 1){
					cb(null, results[0]);
				} else {
					return cb('asset not found', null);
				}
			});
		});
	},

	//Return all approved assets from database that are not marked as guest assets
  returnApprovedAssets: function(cb) {
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			connection.query('SELECT * from whitelistedAssetsWithTypes', function(error, results, fields) {
				connection.release();
				if(err){return cb(err, null, null);}
				return cb(null, results, fields);
			});
		});
	},

	//Return all approved assets from database that are marked as guest assets
  returnGuestAssets: function(cb) {
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			connection.query('SELECT * from whitelistedGuestAssetsWithTypes', function(error, results, fields) {
				connection.release();
				if(err){return cb(err, null, null);}
				return cb(null, results, fields);
			});
		});
	},

	//Return all unapproved assets from database
  returnUnapprovedAssets: function(cb) {
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			connection.query('SELECT * from unapprovedAssetsWithTypes', function(error, results, fields) {
				connection.release();
				if(err){return cb(err, null, null);}
				return cb(null, results, fields);
			});
		});
	},

  //Return all MAC addresses from database
  returnAllMacs: function(cb) {
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			connection.query('SELECT MAC from Assets', function(error, results, fields) {
				connection.release();
				if(err){return cb(err, null, null);}
				return cb(null, results, fields);
			});
		});
	},

	//This function takes in a MAC address.  Then updates the database to change the approved state to 1
	approveAsset: function(assetMac, cb){
		//should check here for properly formed input...
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			var sqlQuery = "UPDATE Assets SET Whitelisted = true WHERE MAC = ?;"

			connection.query(sqlQuery,[assetMac],function(err) {
				connection.release();
				return cb(err);
			});
		});
	},

	//Provide an assets in this form and it will be updated in the database
	//{MAC: 'abc', Name: 'abc', Description: 'fgh', AssetType: 2}
	updateAsset: function(asset, cb){
		//should check here for properly formed input...
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			var sqlQuery = "UPDATE Assets SET Name=?, Description=?, AssetType=? WHERE MAC = ?;"

			connection.query(sqlQuery,[asset.Name.toString().substr(0,49), asset.Description.toString().substr(0,999), asset.AssetType, asset.MAC.toString().substr(0,49)],function(err) {
				connection.release();
				return cb(err);
			});
		});
	},

	//This function takes in a MAC address.  Then deletes that item from the database
	deleteAsset: function(assetMac, cb){
		//should check here for properly formed input...
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			var sqlQuery = "DELETE FROM Assets WHERE MAC = ?;"

			connection.query(sqlQuery,[assetMac],function(err) {
				connection.release();
				return cb(err);
			});
		});
	},

	//Bulk Upserts Assets.  Provide an array of assets in this form [{MAC: 'abc', IP: '123', Vendor: 'fgh'}, {MAC: '321', IP: '345', Vendor: 'ghj'}]
	upsertMany: function(assets, cb){
		//should check here for properly formed input...
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			var sqlQuery = "INSERT INTO Assets (MAC, IP, Vendor) VALUES ? ON DUPLICATE KEY UPDATE IP = VALUES(IP), LastUpdated = CURRENT_TIMESTAMP";
			var values = [];
			for (var i = 0; i < assets.length; i++){
				var value = [assets[i].MAC.toString().substr(0,49), assets[i].IP.toString().substr(0,49), assets[i].Vendor.toString().substr(0,999)];
				values.push(value);
			}

			connection.query(sqlQuery,[values],function(err) {
				connection.release();
				return cb(err);
			});
		});
	},

	//Insert nmap scan data for an asset
	updateNmap: function(assetMac, nmapData, cb){
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			var sqlQuery = "UPDATE Assets SET Nmap=? WHERE MAC = ?;"

			connection.query(sqlQuery,[nmapData.toString().substr(0,999), assetMac.toString()],function(err) {
				connection.release();
				return cb(err);
			});
		});
	}
}

//Export SQL Queries For Users
module.exports.users = {

	//Inserts a new record into the users table
	insertNew: function(userName, userPassword, userRole, cb) {
		if(userName === null || userPassword === null || userRole === null) {
			return cb('username, password, and role cannot be null');
		}
		
		config.settings.returnAllSettings(function(err, settings){
			bcrypt.genSalt(process.env.HASH_STRENGTH, function(err, salt) {
				if(err){return cb(err);}
				
				bcrypt.hash(userPassword, salt, null, function(err, hash) {
					if(err){return cb(err);}
			
					pool.getConnection(function(err, connection) {
						if(err){return cb(err);}
						connection.query('INSERT INTO users (userName, userPass, userRole) VALUES (?, ?, ?)', [userName, hash, userRole], function (err, results, fields) {
							connection.release();
							if(err){return cb(err);}
							return cb(null);
						}); 
					});
				});
			});
		});
	},

	//Update the password for a current user
	updatePassword: function(userName, newPassword, cb) {
		if(userName === null || newPassword === null) {
			return cb('username, password, and role cannot be null');
		}

		config.settings.returnAllSettings(function(err, settings){
			bcrypt.genSalt(process.env.HASH_STRENGTH, function(err, salt) {
				if(err){return cb(err);}
	
				bcrypt.hash(newPassword, salt, null, function(err, hash) {
					if(err){return cb(err);}
					
					pool.getConnection(function(err, connection) {
						if(err){return cb(err);}
	
						var sqlQuery = "UPDATE users SET userPass=? WHERE userName = ?;"
	
						connection.query(sqlQuery, [hash, userName], function(err) {
							connection.release();
							if(err){return cb(err);}
							return cb(null);
						}); 
					});
				});
			});
		});
	},
	
	//Searches database for a username and password pair.  If a match is found the entire user object is returned.  Used for authentication
	selectUsernameAndPassword: function(userName, userPassword, cb) {
		if(userName === null || userPassword === null){
			return cb('username, and password cannot be null');
		}
	
		pool.getConnection(function(err, connection) {
			if(err){return cb(err, null);}
	
			connection.query('SELECT id, userName, roleName, userPass from usersWithRoles WHERE userName = ?', [userName], function (err, results, fields) {
				connection.release();
				if(err){return cb(err, null);}
	
				if (results.length === 1){
					bcrypt.compare(userPassword, results[0].userPass, function(err, res) {
						if (res == true){
							results[0].userPass = null;
							cb(null, results[0]);
						} else {
							cb(null, null);
						}
					});
				} else {
					cb(null, null);
				}
			});
		});
	},
	
	//Searches database for a user by their id.  Used for already logged in sessions
	selectById: function(id, cb) {
		if (id === null) {
			return cb('id cannot be null');
		}
	
		pool.getConnection(function(err, connection) {
			if(err){return cb(err, null);}
		
			connection.query('SELECT id, userName, roleName from usersWithRoles WHERE id = ?', [id], function (err, results, fields) {
				connection.release();
				if(err){return cb(err, null);}
				
				if (results.length === 1){
					cb(null, results[0]);
				} else {
					return cb('id not found', null);
				}
			});
		});
	}
}

//Export SQL Queries For Asset Types
module.exports.assetTypes = {
	//Return all Assets Types from database
  returnAllAssetTypes: function(cb) {
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			connection.query('SELECT * from AssetTypes', function(error, results, fields) {
				connection.release();
				if(err){return cb(err, null, null);}
				return cb(null, results, fields);
			});
		});
	}
}