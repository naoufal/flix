// libraries
var express = require('express');
var app     = express();
var nconf   = require('nconf');

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

// Controllers
var endpoint_controller  = require('./controllers/endpoint');
var movielist_controller = require('./controllers/movie-list');
var movie_controller     = require('./controllers/movie');

// Routes
app.get('/', movielist_controller.home);
app.get('/in-theatres', movielist_controller.in_theatres);
app.get('/box-office', movielist_controller.box_office);
app.get('/new-releases', movielist_controller.new_releases);
app.get('/top-rentals', movielist_controller.top_rentals);

app.get('/movie/:id', movie_controller.index);



app.get('/api/category/in-theatres', endpoint_controller.in_theatres);
app.get('/api/category/box-office', endpoint_controller.box_office);
app.get('/api/category/new-releases', endpoint_controller.new_releases);
app.get('/api/category/top-rentals', endpoint_controller.top_rentals);
app.get('/api/movie/:id', endpoint_controller.movie);
app.get('/api/user/online', function(req, res, next){
  res.json({online: true});
});

// app.get('*', movielist_controller.home);

var port = nconf.get('PORT') || 8888;
app.listen(port);
console.log('Running on port ' + port);

module.exports.app = app;

// require('./test');