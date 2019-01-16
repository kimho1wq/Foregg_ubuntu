var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/',function(req, res, next) {
    console.log('/match get pass request.');
    res.render( 'match', { login:req.session.user });
});

module.exports = router;