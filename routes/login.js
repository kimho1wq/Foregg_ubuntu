var express = require('express');
var router = express.Router();
var async = require('async');


router.get('/', function (req, res) {
    console.log('/login get pass request.');
    res.render('login', { login : req.session.user } );
});

router.post('/', function (req, res) {
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
            res.send('<script type="text/javascript">alert("' + resultJson.message + '");window.location.href = "/login";</script>');
        }
    });
});

module.exports = router;