var express = require('express');
var router = express.Router();
var async = require('async');


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
            
            var data = [title, content, nickname, writer, type];
   
            pool.query('INSERT INTO match_contents (match_title, match_content, match_writer, match_type) VALUES (?,?,?,?,?)', data , (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.result = false;
                    resultJson.message = '글쓰기 삽입 오류';
                    callback(null, resultJson);
                } else {
                    callback(null, resultJson);
                }
            });
        }
    ],  
    function (callback, resultJson) {
       if(resultJson.result){
           res.send('<script type="text/javascript">alert("글쓰기 완료");window.location.href = "/editor";</script>');
       } else {
           res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/users/join";</script>');  
       }  
    });

});


module.exports = router;