"use strict";
const express = require('express')
    , consign = require('consign')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , session = require('express-session')
    , path = require('path')
    //, redisAdapter = require('socket.io-redis')
    //, RedisStore = require('connect-redis')(session)
    , app = express()
    , server = require('http').Server(app)
    , signaling = require('./signaling.js')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

consign()
  .include('models')
  .then('controllers')
  .then('routes')
  .into(app);

server.listen(3000, () => {
  console.log("Chatufla listening on port 3000.");
});
/*
server.listen(process.env.PORT || 5000, () => {
  console.log("Chatufla listening on port " + process.env.PORT + ".");
});
*/

module.exports = app;
