"use strict";

//Import modules
const config = require('./config.js');
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');

//Setup SQL Server connection
var pool = mysql.createPool({
	host		: config.dbAddress,
	user		: config.dbUser,
	password	: config.dbPassword,
	database	:  config.dbName
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

  //Return all MAC addresses from database
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

	//Bulk Upserts Assets.  Provide an array of assets in this for [{MAC: 'abc', IP: '123', Vendor: 'fgh'}, {MAC: '321', IP: '345', Vendor: 'ghj'}]
	upsertMany: function(assets, cb){
		//should check here for properly formed input...
		pool.getConnection(function(err, connection) {
			if(err){return cb(err);}

			var sqlQuery = "INSERT INTO Assets (MAC, IP, Vendor) VALUES ? ON DUPLICATE KEY UPDATE IP = VALUES(IP), LastUpdated = CURRENT_TIMESTAMP";
			var values = [];
			for (var i = 0; i < assets.length; i++){
				var value = [assets[i].MAC, assets[i].IP, assets[i].Vendor];
				values.push(value);
			}

			connection.query(sqlQuery,[values],function(err) {
				connection.release();
				return cb(err);
			});
		});
	}
}

//Export SQL Queries For Users
module.exports.users = {
	insertNew: function(userName, userPassword, userRole, userEmail, cb) {
		if(userName === null || userPassword === null || userRole === null || userEmail === null) {
			return cb('username, password, role, and email cannot be null');
		}
		
		bcrypt.genSalt(config.hashStrength, function(err, salt) {
			if(err){return cb(err);}
			bcrypt.hash(userPassword, salt, null, function(err, hash) {
				if(err){return cb(err);}
				pool.getConnection(function(err, connection) {
					if(err){return cb(err);}
					connection.query('INSERT INTO users (userName, userPass, userRole) VALUES (?, ?, ?, ?)', [userName, hash, userRole], function (err, results, fields) {
						connection.release();
						if(err){return cb(err);}
						return cb(null);
					}); 
				});
			});
		});
	},

	//Inserts a new record into the users table
	insertNew: function(userName, userPassword, userRole, cb) {
		if(userName === null || userPassword === null || userRole === null) {
			return cb('username, password, and role cannot be null');
		}
		
		bcrypt.genSalt(config.hashStrength, function(err, salt) {
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