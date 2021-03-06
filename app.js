var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config');
var routes = require('./routes/index');
var users = require('./routes/users');
var profiles = require('./routes/profile');
var search = require('./routes/search');
var request = require('./routes/requests');
var contacts = require('./routes/contacts');
var authenticate = require('./authenticate')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//if(app.settings.env === 'test') {
//  mongoose.connect(config.mongoTestUrl);
//  console.log("Connecting to " + config.mongoTestUrl)
//} else
{
  console.log("Connecting to " + config.mongoUrl)
  mongoose.connect(config.mongoUrl);
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected correctly to server");
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type, x-access-token, enctype");
  //res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/profiles', profiles);
app.use('/request', request);
app.use('/search', search);
app.use('/contacts', contacts);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
