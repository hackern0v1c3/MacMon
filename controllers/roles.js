const connectRoles = require('connect-roles');

//Setup connect-roles for authorization
var user = new connectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render('access-denied', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

//if user isn't logged in only give them 'view login screen' permission and don't process more rules
user.use(function (req, action) {
  if (!req.isAuthenticated()) return action === 'view login screen';
});

//if user has user role add 'read data' permissions
user.use('read data', function (req) {
if (req.user.roleName === 'user') {
    return true;
  }
});

//if user has 'admin' role allow anything
user.use(function (req) {
  if (req.user.roleName === 'admin') {
    return true;
  }
});

module.exports = user;