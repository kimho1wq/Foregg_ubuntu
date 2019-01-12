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
    var nickname = req.body.post_nickname;
    var content = req.body.post_content;
    var writer = req.session.user.email;
    var type = req.body.post_type;
   
    
    if(!req.session.user) {
        res.send('<script type="text/javascript">alert("로그인하셔야 합니다.");window.location.href = "/login";</script>');
        return;
    }
    
    if(!title || !content) {
        res.send('<script type="text/javascript">alert("제목과 내용을 입력해야합니다.");window.location.href = "/post";</script>');
        return;
    } 
    
    async.waterfall([
		function (callback) {             
            if(!nickname) 
                nickname = req.session.user.name;
            
            pool.query('SELECT * FROM matching', (err, rows) => {
                if (err) {
                    console.log(err);
                    res.send('<script type="text/javascript">alert("DB COUNT ERROR - 다시 시도해주시기 바랍니다.");window.location.href = "/post";</script>');
                    return;
                } 
                
                var match_id = rows.length + 1;
                callback(null, match_id);
            });
        }
    ],  
    function (callback, match_id) {
       
        var data = [match_id, title, content, nickname, writer, type];
   
        pool.query('INSERT INTO matching (match_id, match_title, match_content, match_nickname, match_writer, match_type, match_create_date) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)', data , (err, rows) => {
            if (err) { 
                console.log(err);
                //res.render('queryerror', { err:err } );
                res.send('<script type="text/javascript">alert("글쓰기 오류 발생 - 다시 시도해주시기 바랍니다.");window.location.href = "/post";</script>');
            } else {
                res.send('<script type="text/javascript">alert("글쓰기 완료");window.location.href = "/editor";</script>');
            }
        });
    });

});

/* 
match_id
match_title
match_content
match_writer
match_contactor
match_type
match_flag
match_create_date
match_complete_date
*/

module.exports = router;