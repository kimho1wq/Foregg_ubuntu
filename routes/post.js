var express = require('express');
var router = express.Router();
var async = require('async');

// TODO: 영상편집자만 글쓰기를 허용
router.get('/',function(req, res, next) {
    console.log('/post get pass request.');
    if(req.session.user) {
        async.waterfall([
            function (callback) {
            
                var resultJson = {
                    result: true,
                    message: '',
                    tags: null
                };
            
                pool.query("SELECT * FROM match_contents_type", (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'match type 검색 오류';
                        callback(null, resultJson);
                    } else {
                        resultJson.tags = rows; 
                        callback(null, resultJson);
                    }
                });
            }
        ],
        function (callback, resultJson) {
            if(resultJson.result) {
                res.render('post', { login : req.session.user, tags : resultJson.tags });
            } else {
                res.send('<script type="text/javascript">alert("' + resultJson.message + '");window.location.href = "/users/login";</script>');
            }     
        });
    } else {
        res.send('<script type="text/javascript">alert("로그인이 필요합니다.");window.location.href = "/users/login";</script>');
    }
});


router.post('/', function(req, res, next) {
    console.log('/post post pass request.');
    
    var title = req.body.post_title;
    var content = req.body.post_content;
    var type = req.body.post_type;
    var writer = req.session.user.uid;
    var video_link = req.body.post_link;
    var video_count = 1;
    if(!video_link)
        video_count = 0;
    
    if(!req.session.user) {
        res.send('<script type="text/javascript">alert("로그인하셔야 합니다.");window.location.href = "/users/login";</script>');
        return;
    }
    
    if(!title || !content) {
        res.send('<script type="text/javascript">alert("제목과 내용을 입력해야합니다.");window.location.href = "/post";</script>');
        return;
    } 
    
    async.waterfall([
        function (callback) {   
            var resultJson = {
                result : true,
                message : ''
            };
            
            var data = [title, content, writer, type, video_count];
   
            pool.query('INSERT INTO match_contents (match_title, match_content, match_writer, match_type, match_video_count) VALUES (?,?,?,?,?)', data , (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.result = false;
                    resultJson.message = '글쓰기 삽입 오류1';
                    callback(null, resultJson);
                } else {
                    callback(null, resultJson);
                }
            });
        },
        function (resultJson, callback) {   
            
            if(resultJson.result && video_link) {
                var data = [title, content, writer, type, video_count];
   
                pool.query('SELECT * FROM match_contents WHERE match_title=? AND match_content=? AND match_writer=? AND match_type=? AND match_video_count=? ORDER BY match_create_date DESC', data , (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = '글쓰기 삽입 오류2';
                        callback(null, resultJson);
                    } else {
                        resultJson.match_id = rows[0].match_id;
                        callback(null, resultJson);
                    }
                });
            } else {
                callback(null, resultJson);
            }
            
        },
        function (resultJson, callback) {   
            
            if(resultJson.result && video_link) {
                var data = [resultJson.match_id, video_link];
   
                pool.query('INSERT INTO match_contents_video (match_video_id, match_video_link) VALUES (?,?)', data , (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = '글쓰기 삽입 오류3';
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
       if(resultJson.result){
           res.send('<script type="text/javascript">alert("글쓰기 완료");window.location.href = "/editor";</script>');
       } else {
           res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/post";</script>');  
       }  
    });

});


module.exports = router;
