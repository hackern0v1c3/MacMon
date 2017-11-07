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
	}

}