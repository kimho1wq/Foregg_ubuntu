var express = require('express');
var router = express.Router();
var async = require('async');

// /creater
router.get('/', function (req, res, next) {
    console.log('/creater get pass request.');

    async.waterfall([
		function (callback) {
            
            var resultJson = {
                result: true,
                message: '',
                matchCompleted: -1,
                editorMatching: -1,
                maxLength: -1,
                matchData: null
            };
            
            pool.query('SELECT * FROM match_contents WHERE match_flag = 1', (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.result = false;
                    resultJson.message = 'DB SELECT ERROR1';
                    callback(null, resultJson);
                } else {
                    resultJson.matchCompleted = rows.length;
                    callback(null, resultJson);
                }
            });
		},
        function (resultJson, callback) {
            if(resultJson.result) {
                pool.query('SELECT * FROM match_contents WHERE match_flag = 0', (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR2';
                        callback(null, resultJson);
                    } else {
                        resultJson.editorMatching = rows.length;
                        callback(null, resultJson);
                    }
                });
            } else {
                callback(null, resultJson);
            }
		},
        function (resultJson, callback) {
            if(resultJson.result) {
                pool.query('SELECT * FROM match_contents', (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR3';
                        callback(null, resultJson);
                    } else {
                        resultJson.maxLength = rows.length;
                        callback(null, resultJson);
                    }
                });
            } else {
                callback(null, resultJson);
            }
		},
        function (resultJson, callback) {
            if(resultJson.result) {
                pool.query('SELECT * FROM users u, match_contents mc, match_contents_type mct WHERE mc.match_writer = u.user_uid AND mc.match_type = mct.type ORDER BY match_create_date DESC LIMIT 0, 5', (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR4';
                        callback(null, resultJson);
                    } else {
                        for(var i = 0; i < rows.length; i++) {
                            //Tue Jan 01 2019 08:29:42 GMT+0000
                            //2019-01-01 08:29:20
                            var str = rows[i].match_create_date.toISOString().substr(0,10);
                            rows[i].match_create_date = str;
                        }
                        resultJson.matchData = rows;
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
            res.render('creater/index', { login : req.session.user, matchData: resultJson.matchData, matchCompleted: resultJson.matchCompleted, editorMatching: resultJson.editorMatching, subnav : "creater" });
        } else {
            res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "error";</script>');
        }
    });
});

// /creater/editor
router.get('/editor',function(req, res, next) {
    console.log('/creater/editor get pass request.');
    
    var page = req.query.page;
    if(!page) page = 1;
    
    async.waterfall([
		function (callback) {
            
            var resultJson = {
                result: true,
                message: '',
                matchCompleted: -1,
                editorMatching: -1,
                maxLength: -1,
                matchData: null,
                info: null,
                match_videoData: null,
                tags: null
            };
            
            pool.query('SELECT * FROM match_contents WHERE match_flag = 1', (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.result = false;
                    resultJson.message = 'DB SELECT ERROR1';
                    callback(null, resultJson);
                } else {
                    resultJson.matchCompleted = rows.length;
                    callback(null, resultJson);
                }
            });
		},
        function (resultJson, callback) {
            if(resultJson.result) {
                pool.query('SELECT * FROM match_contents WHERE match_flag = 0', (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR2';
                        callback(null, resultJson);
                    } else {
                        resultJson.editorMatching = rows.length;
                        callback(null, resultJson);
                    }
                });
            } else {
                callback(null, resultJson);
            }
            
		},
        function (resultJson, callback) {
            if(resultJson.result) {
                pool.query('SELECT * FROM match_contents', (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR3';
                        callback(null, resultJson);
                    } else {
                        resultJson.maxLength = rows.length;
                        callback(null, resultJson);
                    }
                });
            } else {
                callback(null, resultJson);
            }
		},
        function (resultJson, callback) {
            if(resultJson.result) {
                 
                var limitPage = 5;
                var limitSize = 10;
                
                pool.query('SELECT * FROM users u, match_contents mc, match_contents_type mct WHERE mc.match_writer = u.user_uid AND mc.match_type = mct.type ORDER BY match_create_date DESC LIMIT ?, ?', [(page-1)*limitSize, limitSize], (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR4';
                        callback(null, resultJson);
                    } else {
                        var pageNum = Math.ceil(resultJson.maxLength/limitSize);
                        var no = resultJson.maxLength-((page - 1)*limitSize);
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
                        resultJson.matchData = rows;
                        resultJson.info = { 
                            startPage: startPage,
                            endPage: endPage,
                            limitPage: limitPage,
                            active: page,
                            pagination: pageNum,
                            no: no
                        };
                        
                        callback(null, resultJson);
                    }
                });  
            } else {
                callback(null, resultJson);
            }
		},
        function (resultJson, callback) {
            if(resultJson.result) {
                pool.query('SELECT match_id, match_video_link, match_create_date FROM match_contents mc, match_contents_video mcv WHERE mc.match_id = mcv.match_video_id ORDER BY match_create_date DESC', (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR5';
                        callback(null, resultJson);
                    } else {
                        resultJson.match_videoData = rows;
                        callback(null, resultJson);
                    }
                });
            } else {
                callback(null, resultJson);
            }
        },
        function (resultJson, callback) {
            if(resultJson.result) {
                pool.query("SELECT * FROM match_contents_type", (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = 'DB SELECT ERROR6';
                        callback(null, resultJson);
                    } else {
                        resultJson.tags = rows; 
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
            res.render('common/matchlist', { login : req.session.user, matchData: resultJson.matchData, matchCompleted: resultJson.matchCompleted, editorMatching: resultJson.editorMatching, info: resultJson.info, match_videoData: resultJson.match_videoData, tags: resultJson.tags, subnav : "creater", headlineTitle : "전문편집자" });
        } else {
            res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/";</script>');
        }
    });
});



module.exports = router;