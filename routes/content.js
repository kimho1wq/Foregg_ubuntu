var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/',function(req, res, next) {
    console.log('/content get pass request.');
    var content_id = req.param('id');
    
    async.waterfall([
		function (callback) {
            var resultJson = {
                flag: true
            };
            
            callback(null, resultJson);
		}
	],
    function (callback, resultJson) {
        pool.query('SELECT * FROM matching WHERE match_id = ?', [content_id], (err, rows) => {
            if (err) {
                console.log(err);               
                res.send('<script type="text/javascript">alert("DB SELECT ERROR1 - 다시 시도해주시기 바랍니     다.");window.location.href = "/";</script>'); 
                return;
            } 
            else {
                if(rows) { 
                    res.render('content', { login : req.session.user, matchData: rows[0] });
                }
                else {
                    res.send('<script type="text/javascript">alert("ERROR - 다시 시도해주시기 바랍니다.ㅎㅎ");window.location.href = "/";</script>');
                }
            }
        });    
    });
    
});


module.exports = router;