var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var mysql = require('mysql');

//var passport = require('passport');
//var flash = require('connect-flash');
//var passport_fb = require('./lib/passport_init');
//passport_fb(app, passport);

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var creater = require('./routes/creater');
var post = require('./routes/post');
var content = require('./routes/content');
var match = require('./routes/match');
var record = require('./routes/record');

require('./lib/mysql_init');
require('./lib/firebase_init');

var app = express();

//passport 사용 설정
//app.use(passport.initialize());
//app.use(passport.session());
//app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my key',
    resave: false,
    saveUninitialized: true
}));

/* route */
app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/record', record);   // record
app.use('/creater', creater); // creater
app.use('/post', post);
app.use('/content', content);
app.use('/match', match);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
