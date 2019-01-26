var express = require('express');
var router = express.Router();

router.get('/record', function (req, res) {
    console.log('/record get pass request.');
    res.render('record', { login : req.session.user, subnav : "record" } );
});
