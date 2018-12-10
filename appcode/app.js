"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const logger = require('./controllers/logger.js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./private/config.json');
const index = require('./routes/index');
const login = require('./routes/login.js');
const admin = require('./routes/admin.js');
const guest = require('./routes/guest.js');
const pending = require('./routes/pending.js');
const assets = require('./routes/assets.js');
const assettypes = require('./routes/assettypes.js');
const settings = require('./routes/settings.js');
const logout = require('./routes/logout.js');
const passwordreset = require('./routes/passwordreset.js');
const user = require('./controllers/roles.js');
const run_scanner = require('./controllers/run_scanner.js');
const timers = require('timers');

const db = require('./controllers/db.js');
const passport = require('passport');
const strategy = require('passport-local').Strategy;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Setup Passport for authentication
passport.use(new strategy(function (username, password, cb) {
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

//Load Middleware
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '/public/', 'favicon.ico')));
app.use(morgan('combined', { 'stream': logger.stream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: config.cookieSecret, resave: false, saveUninitialized: false }));

//Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

//Initialize connect-roles for authorization
app.use(user.middleware());

//Routes for static public content
app.use(express.static(path.join(__dirname, 'public')));

//Include all routes
app.use('/', index);
app.use('/login', login);
app.use('/admin', admin);
app.use('/guest', guest);
app.use('/pending', pending);
app.use('/settings', settings);
app.use('/assets', assets);
app.use('/assettypes', assettypes);
app.use('/logout', logout);
app.use('/passwordreset', passwordreset);

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
  res.locals.error = process.env.LOG_LEVEL === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Start timer to run network scanner
run_scanner.runOnce();

var scannerTimer = timers.setInterval(function(){
  run_scanner.runOnce();
},(config.scanInterval * 1000));

module.exports = app;
