// libraries
var express = require('express');
var app     = express();
var nconf   = require('nconf');

// Run initializers
require('./lib/init-all');

// Configuration
app.locals.config = {};
app.locals.config.NODE_ENV = nconf.get('NODE_ENV');

// Middleware
app.use(function(req, res, next){
  res.locals.url = 'http://' + req.headers.host;
  if (nconf.get('NODE_ENV') == 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
});
app.use('/', express.static(__dirname + '/public/'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser()); // parse cookies
app.use(app.router);

// Routes
require('./routes')(app);

var port = nconf.get('PORT') || 8888;
app.listen(port);
console.log('Running on port ' + port);

module.exports.app = app;

// require('./test');