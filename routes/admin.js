const express = require('express');
const router = express.Router();
const user = require('../controllers/roles.js');

/* GET admin page. */
router.get('/', user.can('be admin'), function (req, res) {
    res.render('index', { username: req.user.userName });
});


module.exports = router;
