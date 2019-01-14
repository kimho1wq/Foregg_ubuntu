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
            res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/editor";</script>');
        }
    });
});

router.post('/', function(req, res, next) {
    console.log('/content post pass request.');
    var content_id = req.body.id;
    
    async.waterfall([
		function (callback) {
            var resultJson = {
                result : true,
                message : '',
                match_data
            };
            
            pool.query('SELECT match_id, match_video_count FROM match_contents WHERE match_id = ?', [content_id], (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.result = false;
                    resultJson.message = 'DB 삭제 오류1';
                    callback(null, resultJson);
                } else {
                    resultJson.match_data = rows[0];
                    callback(null, resultJson);
                }
            });    
		},
        function (resultJson, callback) {
            if(resultJson && resultJson.match_data.match_video_count) {
                pool.query('DELETE FROM match_contents_video WHERE match_video_id = ?', [content_id], (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB 삭제 오류2';
                        callback(null, resultJson);
                    } else {
                        callback(null, resultJson);
                    }
                });    
            } else {
                callback(null, resultJson);
            }    
		},
        function (resultJson, callback) {
            if(resultJson) {
                pool.query('DELETE FROM match_contents WHERE match_id = ?', [content_id], (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB 삭제 오류3';
                        callback(null, resultJson);
                    } else {
                        callback(null, resultJson);
                    }
                });    
            } else {
                callback(null, resultJson);
            }    
		}
	],
    function (callback, resultJson) {
        if(resultJson.result) { 
            res.send('<script type="text/javascript">alert("삭제 되었습니다.");window.location.href = "/editor";</script>');
        } else {
            res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/editor";</script>');
        }
    });
});


module.exports = router;
