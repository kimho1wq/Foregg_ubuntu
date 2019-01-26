var express = require('express');
var router = express.Router();

router.get('/record', function (req, res) {
    console.log('/record get pass request.');
    res.render('record/index', { login : req.session.user, subnav : "record" } );
});


module.exports = router;