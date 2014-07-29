var endpoint_controller  = require('./controllers/endpoint');
var movielist_controller = require('./controllers/movie-list');
var movie_controller     = require('./controllers/movie');

module.exports = function(app) {
  app.get('/', movielist_controller.home);
  app.get('/in-theatres', movielist_controller.in_theatres);
  app.get('/box-office', movielist_controller.box_office);
  app.get('/new-releases', movielist_controller.new_releases);
  app.get('/top-rentals', movielist_controller.top_rentals);
  app.get('/movie/:id', movie_controller.index);


  // Endpoints URLS
  app.get('/api/category/in-theatres', endpoint_controller.in_theatres);
  app.get('/api/category/box-office', endpoint_controller.box_office);
  app.get('/api/category/new-releases', endpoint_controller.new_releases);
  app.get('/api/category/top-rentals', endpoint_controller.top_rentals);
  app.get('/api/movie/:id', endpoint_controller.movie);
  app.get('/api/user/online', function(req, res, next){
    res.json({online: true});
  });
}
