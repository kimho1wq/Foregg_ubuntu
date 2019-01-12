var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/',function(req, res, next) {
    console.log('/editor get pass request.');
    
    var page = req.param('page');
    if(!page) page = 1;
    var matchCompleted = -1;
    var editorMatching = -1;
    var createrMatching = -1;
    var maxLength = -1;
    
    var limitPage = 5;
    var limitSize = 10;
    
    async.waterfall([
		function (callback) {
            
            var resultJson = {
                flag: true
            };
            
            pool.query('SELECT * FROM match_contents WHERE match_flag = 1', (err, rows) => {
                if (err) {
                    console.log(err);               
                    res.send('<script type="text/javascript">alert("DB SELECT ERROR2 - 다시 시도해주시기 바랍니     다.");window.location.href = "/";</script>'); 
                    return;
                } 
                else {
                    matchCompleted = rows.length;
                    callback(null, resultJson);
                }
            });
		},
        function (resultJson, callback) {
            pool.query('SELECT * FROM match_contents WHERE match_flag = 0 AND match_type = 1', (err, rows) => {
                if (err) {
                    console.log(err);               
                    res.send('<script type="text/javascript">alert("DB SELECT ERROR3 - 다시 시도해주시기 바랍니     다.");window.location.href = "/";</script>'); 
                    return;
                } 
                else {
                    editorMatching = rows.length;
                    callback(null, resultJson);
                }
            });
		},
        function (resultJson, callback) {
            pool.query('SELECT * FROM match_contents WHERE match_flag = 0 AND match_type = 2', (err, rows) => {
                if (err) {
                    console.log(err);               
                    res.send('<script type="text/javascript">alert("DB SELECT ERROR4 - 다시 시도해주시기 바랍니     다.");window.location.href = "/";</script>'); 
                    return;
                } 
                else {
                    createrMatching = rows.length;
                    callback(null, resultJson);
                }
            });
		},
        function (resultJson, callback) {
            pool.query('SELECT * FROM match_contents', (err, rows) => {
                if (err) {
                    console.log(err);               
                    res.send('<script type="text/javascript">alert("DB SELECT ERROR5 - 다시 시도해주시기 바랍니다.");window.location.href = "/";</script>'); 
                    return;
                } 
                else {
                    maxLength = rows.length;
                    callback(null, resultJson);
                }
            });
		}
	],
    function (callback, resultJson) {
        pool.query('SELECT * FROM match_contents ORDER BY match_create_date DESC LIMIT ?, ?', [(page-1)*limitSize, limitSize], (err, rows) => {
            if (err) {
                console.log(err);               
                res.send('<script type="text/javascript">alert("DB SELECT ERROR1 - 다시 시도해주시기 바랍니다.");window.location.href = "/";</script>'); 
                return;
            } 
            else {
                var pageNum = Math.ceil(maxLength/limitSize);
                var no = maxLength-((page - 1)*limitSize);
                var startPage = (Math.floor((page-1)/limitPage)*limitPage)+1;
                var endPage = startPage + limitPage - 1;
                if(endPage > pageNum) 
                    endPage = pageNum;
                
                for(var i = 0; i < rows.length; i++) {
                    //Tue Jan 01 2019 08:29:42 GMT+0000
                    //2019-01-01 08:29:20
                    var str = rows[i].match_create_date.toISOString().substr(0,10);
                    rows[i].match_create_date = str;               
                }
                var info = { startPage: startPage, endPage: endPage, limitPage: limitPage, active: page, pagination: pageNum, no: no };
                
                if( matchCompleted != -1 && editorMatching != -1 && createrMatching != -1) {
                    
                    res.render('editor', { login : req.session.user, matchData: rows, matchCompleted: matchCompleted, editorMatching: editorMatching, createrMatching: createrMatching, info: info });
                }
                else {
                    res.send('<script type="text/javascript">alert("ERROR - 다시 시도해주시기 바랍니다.ㅎㅎ");window.location.href = "/";</script>');
                }
            }
        });    
    });
});



module.exports = router;