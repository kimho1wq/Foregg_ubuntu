var express = require('express');
var router = express.Router();
var async = require('async');
var fs = require('fs');
var multer = require('multer');

//파일 저장위치와 파일이름 설정
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //파일이 이미지 파일이면
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
            console.log("이미지 파일이네요");
            cb(null,'uploads/images');
            //텍스트 파일이면
        } else if (file.mimetype == "application/pdf" || file.mimetype == "application/txt" || file.mimetype == "application/octet-stream") {
            console.log("텍스트 파일이네요");
            cb(null,'uploads/texts');
        }
    },
    //파일이름 설정
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

//파일 업로드 모듈
var upload = multer({ storage: storage });


router.get('/join', function (req, res) {
    console.log('/join get pass request.');
    res.render('join', { login : req.session.user } );
});

router.get('/login', function (req, res) {
    console.log('/login get pass request.');
    res.render('login', { login : req.session.user } );
});

router.post('/join', upload.single('join_picture'), function (req, res) {
    console.log('join 들어옴');
    
    var picture = req.file.path;
    var email = req.body.join_email;
    var password = req.body.join_password;
    var nickname = req.body.join_nickname;
    var username = req.body.join_name;
    var phone = req.body.join_phone;
    var type = req.body.type;
    
    console.log(email,password,username,phone,type);
    
    if(validateJoinValue(email, password, username, phone, type)) {
        
        async.waterfall([    
            function (callback) {
           
                var values = {
                    result : true,
                    message : ''
                };
                 
                //Foregg DB에 user정보 저장
                var data = [picture, email, password, type, username, nickname, phone];
                console.log(data);
                
                pool.query('INSERT INTO users (user_picture, user_email, user_password, user_type, user_name, user_nickname, user_phone) VALUES (?,?,HEX(AES_ENCRYPT(?,"fuosreergsg")),?,?,?,?)', data, (err, rows) => {
                    if (err) {
                        console.log('in1');
                        console.log(err);
                        values.result = false;
                        values.message = '회원 정보 삽입 오류';
                        callback(null, values);
                    } else {
                        console.log('in2');
                        callback(null, values);
                    }
                });
            }
        ], 
        function (callback, values) {
            if(values.result)
                res.send('<script type="text/javascript">alert("회원가입 완료");window.location.href = "/users/login";</script>');
            else
                res.send('<script type="text/javascript">alert("회원가입 오류 발생 - 다시 시도해주시기 바랍니다.");window.location.href = "/users/join";</script>');
        });
    }
    else {
        res.send('<script type="text/javascript">alert("비밀번호는 숫자와 문자를 섞어 6자리 이상으로 만들어 주시기 바랍니다.");window.location.href = "/users/join";</script>');
    }
});

function validateJoinValue(email, password, username, phone, type) {
    
    return true;
    
    var emailfilter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if( !(email && emailfilter.test(email)) )
        return false;

    var passwordfilter = /^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    if( !(password && passwordfilter.test(password)) )
        return false;

    if( !(username && username.length >= 2))
        return false;

    if( !(phone && phone.length == 11))
        return false;

    if( !(type && type.length >= 1))
        return false;
    
    return true;
}

router.post('/login', function (req, res) {
    var sess = req.session;
    var email = req.body.signInEmail;
    var password = req.body.signInPassword;

    async.waterfall([
		function (callback) {             
            var resultJson = {
                verified: false,
                message: ''
            };
            
            var data = [email, password];
            pool.query('SELECT * FROM users where user_email=? AND user_password=HEX(AES_ENCRYPT(?,"fuosreergsg"))', data, (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.message = 'query error';
                    callback(null, resultJson);
                } else {
                    if (rows.length > 0) { //database에 user정보가 존재 할 경우.
                        resultJson.userInfo = rows[0];
                        resultJson.verified = true;
                    }
                    else {
                        resultJson.message = 'email 또는 password 가 틀렸습니다.';  
                    }
                    callback(null, resultJson);
                }
            });  
        }
    ],  
    function (callback, resultJson) {
        if(resultJson.verified) {
            sess.user = {
                email: resultJson.userInfo.user_email,
                name: resultJson.userInfo.user_name,
                type: resultJson.userInfo.user_type,
                phone: resultJson.userInfo.user_phone,
                authorized: false
            }
                
            res.redirect('/');
                    
        } else {
            res.send('<script type="text/javascript">alert("' + resultJson.message + '");window.location.href = "/users/login";</script>');
        }
    });
});

router.get('/logout', function (req, res) {
    console.log('/logout post 패스 요청됨.');
    if(req.session.user) {
        console.log('로그아웃합니다.');
        req.session.destroy(function(err) {
            if(err) {throw err;}
            res.send('<script type="text/javascript">alert("로그아웃 되었습니다.");window.location.href = "/";</script>');
        });
    } else {
        res.send('<script type="text/javascript">alert("로그인이 되어있지 않습니다.");window.location.href = "/";</script>');
    }
});


module.exports = router;