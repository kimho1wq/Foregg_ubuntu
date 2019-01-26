var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/', function (req, res, next) {
    console.log('/record get pass request.');
    res.render('record/index', { login : req.session.user, subnav : "record" } );
});


module.exports = router;