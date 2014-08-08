// libraries
var express     = require('express');
var app         = express();
var compress    = require('compression');
var nconf       = require('nconf');

// Run initializers
require('./lib/init-all');

// Configuration
app.locals.config = {};
app.locals.config.NODE_ENV = nconf.get('NODE_ENV');
// Initialize hashUrl
require('./lib/init-helper-hash-url').init(app);

// Middleware
app.use(compress());
app.use(function(req, res, next){
  res.locals.path = req._parsedUrl.pathname;
  res.locals.url = 'http://' + req.headers.host;
  next();
});
app.set('view engine', 'jade');

// Asset caching and local CORS
var one_year = 31536000000;
if (nconf.get('NODE_ENV') == 'development') {
  app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/', express.static(__dirname + '/public/'));
} else {
  app.use('/', express.static(__dirname + '/public-hashed/', { maxAge: one_year }));
}


// Routes
require('./routes')(app);

var port = nconf.get('PORT') || 8888;
app.listen(port);
console.log('Running on port ' + port);

module.exports.app = app;

require('./lib/poll-lists');
// require('./test');
