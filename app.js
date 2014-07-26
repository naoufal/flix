// libraries
var express = require('express');
var app     = express();
var nconf   = require('nconf');

var controllers = require('./controllers');

// Run initializers
require('./lib/init-all');

// Configuration
app.configure(function(){
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
});

// Routes
app.get('/', function(req, res){
  res.render('index');
});

app.get('/api/category/in-theatres', controllers.in_theatres);
app.get('/api/category/box-office', controllers.box_office);
app.get('/api/category/new-releases', controllers.new_releases);
app.get('/api/category/top-rentals', controllers.top_rentals);
app.get('/api/movie/:id', controllers.movie);
app.get('/api/user/online', function(req, res, next){
  res.json({online: true});
});

app.get('*', function(req, res){
  res.render('index');
});

var port = nconf.get('PORT') || 8888;
app.listen(port);
console.log('Running on port ' + port);

module.exports.app = app;

// require('./test');