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
            console.log("이미지파일");
            cb(null,'public/img/profile');
        } else {
            console.log("이미지파일 아니면 error.");
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

//router.post('/join', upload.single('join_picture'), function (req, res) {
router.post('/join', function (req, res) {
    console.log('/join post pass request.');
    if (req.body) {
        //var picture = req.file.path;
        var email = req.body.join_email;
        var password = req.body.join_password;
        var nickname = req.body.join_nickname;
        var phone = req.body.join_phone;
        var type = req.body.type;
    
        console.log(email,password,nickname,phone,type);

        if(validateJoinValue(email, password, nickname, phone, type)) {
            async.waterfall([    
                function (callback) {
                    var resultJson = {
                        result : true,
                        message : ''
                    };
                    
                    firebaseAuth.createUserWithEmailAndPassword(email, password).then(function() {
                        firebaseAuth.signInWithEmailAndPassword(email, password).then(function() {
                            console.log("성공");
                            firebaseAuth.onAuthStateChanged(function(user) {
                                if (user) {
                                    // firebase db에 user 정보 추가
                                    resultJson.uid = user.uid;
                                    firebaseDB.collection("users").doc(user.uid).set({
                                        uid : user.uid,
                                        nickname: nickname,
                                        email: email,
                                        phone: phone,
                                        type: type
                                    }).then(function() {
                                        console.log("success");
                                        callback(null, resultJson);
                                    }).catch(function(error) {
                                        console.log(error);
                                        resultJson.result = false;
                                        resultJson.message = error.message;
                                        callback(null, resultJson);
                                    });            
                                } else {  
                                    resultJson.result = false;
                                    callback(null, resultJson);
                                }
                            });
                        }).catch(function(error) {
                            // Handle Errors here.
                            console.log(error);
                            resultJson.result = false;
                            resultJson.message = error.message;
                            callback(null, resultJson);
                        });
                    }).catch(function(error) {
                        console.log(error);
                        resultJson.result = false;
                        resultJson.message = error.message;
                        callback(null, resultJson);
                    });
                },
                function (resultJson, callback) {
                    if (resultJson.result && resultJson.uid) {
                        var data = [resultJson.uid, email, nickname, phone, type];
                        pool.query("INSERT INTO users(user_uid, user_email, user_nickname, user_phone, user_type) VALUES (?,?,?,?,?)", data, (err, rows) => {
                            if (err) {
                                console.log(err);
                                resultJson.result = false;
                                resultJson.message = '회원 정보 삽입 오류';
                                callback(null, resultJson);
                            } else {
                                callback(null, resultJson);
                            }
                        })
                    }
                    else
                        callback(null, resultJson);
                }
            ],
            function (callback, resultJson) {
                if(resultJson.result){
                    res.send('<script type="text/javascript">alert("회원가입 완료");window.location.href = "/users/login";</script>');
                } else {
                    res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/users/join";</script>');  
                }
            });
        } else {
            res.send('<script type="text/javascript">alert("불완전한 요청입니다. 다시 시도해주세요.");window.location.href = "/users/join";</script>');
        }
    } else {
        res.send('<script type="text/javascript">alert("비정상적인 요청입니다. 다시 시도해주세요.");window.location.href = "/users/join";</script>');
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


router.get('/login', function (req, res) {
    console.log('/login get pass request.');
    res.render('login', { login : req.session.user } );
});

router.post('/login', function (req, res) {
    console.log('/login post request.');
    var sess = req.session;
    var email = req.body.signInEmail;
    var password = req.body.signInPassword;

    if(sess.user) 
        res.send('<script type="text/javascript">alert("이미 로그인 되어 있습니다.");window.location.href = "/";</script>');
	
    
    async.waterfall([
		function (callback) {
            var resultJson = {
                result: true,
                message: ''
            };
            
            firebaseAuth.signInWithEmailAndPassword(email, password).then(function () {
                firebaseAuth.onAuthStateChanged(function (user) {
                    if (user) {
                        firebaseDB.collection("users").doc(user.uid).get().then((doc) => {
                            resultJson.uid = user.uid;
                            if (doc.exists) {
                                console.log("firebaseLogin Access");
                                callback(null, resultJson);
                            } else {
                                // doc.data() will be undefined in this case
                                resultJson.result = false;
                                resultJson.message = 'No such document!';
                                callback(null, resultJson);
                            }
                        });    
                    } else {
                        resultJson.result = false;
                        resultJson.message = '서버로부터 유저 정보를 받아오지 못하였습니다.';
                        callback(null, resultJson);
                    }
                });
            }).catch(function (error) {
                resultJson.result = false;
                var errorCode = error.code;
                switch (errorCode) {
                    case 'auth/invalid-email':
                        resultJson.message = 'Email을 정확하게 입력해주세요.';
                        break;
                    case 'auth/user-not-found':
                        resultJson.message = '존재하지 않는 Email입니다.';
                        break;
                    case 'auth/wrong-password':
                        resultJson.message = '비밀번호를 확인해주세요.';
                        break;
                }
                callback(null, resultJson);
            });
		},
        function (resultJson, callback) {
            if (resultJson.result && resultJson.uid) {
                var data = [resultJson.uid];
                pool.query("SELECT * FROM users WHERE user_uid=?", data, (err, rows) => {
                    if (err) {
                        console.log(err);
                        resultJson.result = false;
                        resultJson.message = '회원 정보 검색 오류';
                        callback(null, resultJson);
                    } else {
                        sess.user = {
                            uid: rows[0].user_uid,
                            picture: rows[0].user_picture,
                            email: rows[0].user_email,
                            nickname: rows[0].user_nickname,
                            type: rows[0].user_type,
                            phone: rows[0].user_phone
                        };
                        callback(null, resultJson);
                    }
                })
            }
            else
                callback(null, resultJson);
		}
	],
    function (callback, resultJson) {
        if(resultJson.result) {
            res.send('<script type="text/javascript">alert("로그인되었습니다.");window.location.href = "/";</script>');
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


router.get('/info', function (req, res) {
    console.log('/info get pass request.');
    res.render('info', { login : req.session.user } );
});

router.post('/info', upload.single('profile_picture'), function (req, res) {
    console.log('/info post pass request.');
    var sess = req.session.user;
    var str = req.file.path;
    var picture = str.substring(7,str.length); 
   
    async.waterfall([    
        function (callback) {
            var resultJson = {
                result : true,
                message : ''
            };
                    
            var data = [picture, sess.uid];
            pool.query("UPDATE users SET user_picture=? WHERE user_uid=?", data, (err, rows) => {
                if (err) {
                    console.log(err);
                    resultJson.result = false;
                    resultJson.message = '회원 정보 삽입 오류';
                    callback(null, resultJson);
                } else {
                    sess.picture = picture;
                    callback(null, resultJson);
                }
            });
        }
    ],
    function (callback, resultJson) {
         if(resultJson.result){
             res.send('<script type="text/javascript">alert("회원 정보 수정 완료");window.location.href = "/";</script>');
         } else {
             res.send('<script type="text/javascript">alert("'+ resultJson.message +'");window.location.href = "/users/info";</script>');  
         }
    }); 
});

/*// 패스포트 - 페이스북 인증 라우팅
router.get('/facebook', passport.authenticate('facebook', {
  authType: 'rerequest', scope: ['public_profile', 'email']
}));

// 패스포트 - 페이스북 인증 콜백 라우팅
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/');
});*/

router.post('/login_fb', function (req, res) {
    console.log('/fb login post pass request.');
    
    /*var provider = new firebase.auth.FacebookAuthProvider();
    console.log('provider good');
    firebase.auth().languageCode = 'fr_FR';
    // To apply the default browser preference instead of explicitly setting it.
    // firebase.auth().useDeviceLanguage();
    console.log('lang code good');
    provider.setCustomParameters({
        'display': 'popup'
    });
    
    console.log('-----auth start-----');
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        console.log('result: '+result);
        var token = result.credential.accessToken;
        console.log('token: '+token);
        // The signed-in user info.
        var user = result.user;
        console.log('user: '+user);
        // ...
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log('error.code: '+error.code);
        console.log('error.message: '+error.message);
        console.log('error.email: '+error.email);
        // ...
    });*/
   
    /*firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });*/
});


module.exports = router;
