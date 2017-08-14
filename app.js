"use strict";
const express = require('express')
  , cfg = require('./config.json')
  , consign = require('consign')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , path = require('path')
  //, redisAdapter = require('socket.io-redis')
  //, client = require('redis').createClient()
  //, RedisStore = require('connect-redis')(session)
  , app = express()
  , server = require('http').Server(app)
  //, io = require('socket.io')(server)
  , signaling = require('./signaling.js')(server);

  /*var cookie = cookieParser(cfg.SECRET)
    , store = new session.MemoryStore()
    , sessOpts = { secret: cfg.SECRET
                 , key: cfg.KEY
                 , resave: false
                 , saveUninitialized: true
                 , store: store };

  //var options = { host: 'localhost', port: 6379, client: client };
  //var sessOpts = { store: new RedisStore(options)
                 , secret: cfg.SECRET
                 , key: cfg.KEY
                 , resave: false
                 , saveUninitialized: true };
                 */
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(session(sessOpts));

// comentei session app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//io.adapter(redisAdapter(cfg.REDIS));
/*io.use(function(socket, next) {
  var data = socket.request;
  cookie(data, {}, function(err) {
    var sessionID = data.signedCookies[cfg.KEY];
    store.get(sessionID, function(err, session) {
      if (err || !session) {
        return next(new Error('not authorized'));
      } else {
        socket.handshake.session = session;
        return next();
      }
    });
  })
});
*/
consign()
  .include('models')
  .then('controllers')
  .then('routes')
  .into(app);
/*
server.listen(3000, () => {
  console.log("Chatufla listening on port 3000.");
});
*/
server.listen(process.env.PORT || 5000, () => {
  console.log("Chatufla listening on port " + process.env.PORT + ".");
});

module.exports = app;
