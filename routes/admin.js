var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/',function(req, res, next) {
    console.log('/ get pass request.');
    res.render('index', { login : req.session.user });
});

module.exports = router;