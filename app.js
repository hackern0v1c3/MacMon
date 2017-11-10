"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const logger = require('./private/logger.js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./private/config.js');

const index = require('./routes/index');
const users = require('./routes/users');

const db = require('./private/db.js');
const passport = require('passport');
const strategy = require('passport-local').Strategy;
const connectRoles = require('connect-roles');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/*
//Setup Passport for authentication
passport.use(new Strategy(function (username, password, cb) {
    db.users.selectUsernameAndPassword(username, password, function(err, user) {
      return cb(err, user);
    });
  }));
  
  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });
  
  passport.deserializeUser(function(id, cb) {
    db.users.selectById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });
*/

//Setup connect-roles for authorization
var user = new connectRoles({
    failureHandler: function (req, res, action) {
      //optional function to run custom code when user fails authorization
      var accept = req.headers.accept || '';
      res.status(403);
    }
  });

//Load Middleware
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('combined', { 'stream': logger.stream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: config.cookieSecret, resave: false, saveUninitialized: false }));

//Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

//Initialize connect-roles for authoerization
app.use(user.middleware());

//Routes for static public content
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in developmentlogger
  res.locals.message = err.message;
  res.locals.error = config.environment === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
