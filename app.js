var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var mysql = require('mysql');


var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var editor = require('./routes/editor');
var post = require('./routes/post');
var content = require('./routes/content');

require('./lib/mysql_init');
require('./lib/firebase_init');
var app = express();

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

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/editor', editor);
app.use('/post', post);
app.use('/content', content);

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
