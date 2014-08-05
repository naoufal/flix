var _         = require('lodash');
var moment    = require('moment');
var async     = require('async');
var VError    = require('verror');
var getMovies = require('../lib/get-movies');

var LIST_TITLE = {
  in_theaters: 'In Theaters',
  box_office: 'Box Office',
  new_releases: 'New Releases',
  top_rentals: 'Top Rentals'
}


exports.home = function(req, res){
  getMovieList('in_theaters', function(err, movies){
    res.locals.list_title = LIST_TITLE['in_theaters'];
    // if error render error page.
    res.render('movie-list', {
      movies: movies
    });
  });
}

exports.in_theatres = function(req, res){
  getMovieList('in_theaters', function(err, movies){
    res.locals.list_title = LIST_TITLE['in_theaters'];
    // if error render error page.
    res.render('movie-list', {
      movies: movies
    });
  });
}

exports.box_office = function(req, res){
  getMovieList('box_office', function(err, movies){
    res.locals.list_title = LIST_TITLE['box_office'];
    // if error render error page.
    res.render('movie-list', {
      movies: movies
    });
  });
}

exports.new_releases = function(req, res){
  getMovieList('new_releases', function(err, movies){
    res.locals.list_title = LIST_TITLE['new_releases'];
    // if error render error page.
    res.render('movie-list', {
      movies: movies
    });
  });
}

exports.top_rentals = function(req, res){
  getMovieList('top_rentals', function(err, movies){
    res.locals.list_title = LIST_TITLE['top_rentals'];
    // if error render error page.
    res.render('movie-list', {
      movies: movies
    });
  });
}



var getMovieList = function(list_slug, cb){
  async.waterfall([
    function getData(next){
      getMovies.movieList(list_slug, function(err, movies) {
        if (err) return next(err);
        next(null, movies);
      });
    },
    function formatData(movies, next){
      async.map(movies, function(movie, next_movie){
        var runtime = moment.duration(movie.runtime, 'minutes');

        movie.formatted_cast = _.chain(movie.cast)
          .first(3)
          .pluck('name')
          .value()
          .toString().replace(/,/g, ', ');

        movie.formatted_runtime = runtime.hours() + 'h ' + runtime.minutes() + 'm';
        movie.formatted_date = moment(movie.release_date).format('MMMM D, YYYY');

        next_movie(null, movie);
      }, function afterAll(err, movies) {
        next(null, movies);
      });
    }
  ], function finish(err, movies){
    if (err) return cb(new VError(err, 'Could not fetch movie list'));

    cb(null, movies)
  });
};
