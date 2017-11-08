//Import modules
var config = require('./config.js');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

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

			console.log("about to insert")

			var sqlQuery = "INSERT INTO Assets (MAC, IP, Vendor) VALUES ? ON DUPLICATE KEY UPDATE IP = VALUES(IP), LastUpdated = CURRENT_TIMESTAMP";
			var values = [];
			for (i = 0; i < assets.length; i++){
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