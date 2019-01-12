var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/',function(req, res, next) {
    console.log('/content get pass request.');
    var content_id = req.query.id;
    
    async.waterfall([
		function (callback) {
            var resultJson = {
                result : true,
                message : '',
                matchData: null
            };
            
            pool.query('SELECT * FROM users u, match_contents mc, match_contents_type mct WHERE mc.match_id = ? AND mc.match_writer = u.user_uid AND mc.match_type = mct.type', [content_id], (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.result = false;
                    resultJson.message = '글 정보를 찾지 못하였습니다.';
                    callback(null, resultJson);
                } else {
                    resultJson.matchData = rows[0];
                    callback(null, resultJson);
                }
            });    
		}
	],
    function (callback, resultJson) {
        if(resultJson.result) { 
            res.render('content', { login : req.session.user, matchData: resultJson.matchData });
        } else {
            res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/users/join";</script>');
        }
    });
});


module.exports = router;
