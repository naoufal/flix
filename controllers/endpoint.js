var getMovies = require('../lib/get-movies');
/* TODO:
  - Movie render/json method into middleware that handlers error handling.
*/
exports.in_theatres = function(req, res){
  getMovies.rt('in_theatres', function(err, movies) {
    if (err) return res.json({error: err.message});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
};

exports.box_office = function(req, res){
  getMovies.rt('box_office', function(err, movies) {
    if (err) return res.json({error: err.message});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
};

exports.new_releases = function(req, res){
  getMovies.rt('new_releases', function(err, movies) {
    if (err) return res.json({error: err.message});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
};

exports.top_rentals = function(req, res){
  getMovies.rt('top_rentals', function(err, movies) {
    if (err) return res.json({error: err.message});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
}

exports.movie = function(req, res){
  var id = req.params.id;
  getMovies.tmdb(id, function(err, movie){
    if (err) return res.json({error: err.message});
    res.json({timestamp: new Date().getTime(), movie: movie});
  })
}