var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(app, passport) {
    console.log('passport_init 호출됨');
    passport.use('facebook', facebookLogin(app, passport));
    
    //사용자 인증에 성공했을 때 호출
    passport.serializeUser(function(user, done) {
        console.log('serializeUser() 호출됨');
        console.dir(user);
        done(null, user);
    });
    
    //사용자 인증 이후 사용자 요청이 있을 때마다 호출
    passport.deserializeUser(function(user, done) {
        console.log('deserializeUser() 호출됨');
        console.dir(user);
        done(null, user);
    });
    
};

function facebookLogin(app, passport) {
    console.log('facebook function 호출됨');
    return new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone',
                        'updated_time', 'verified', 'displayName']
    }, function(accessToken, refreshToken, profile, done) {
        console.log('passport의 facebook 호출됨.');
        
        var auth_email = profile.emails[0].value;
        var auth_name = profile.displayName;
        console.log('auth_email : ' + auth_email + ' auth_name : ' + auth_name);

    });
};