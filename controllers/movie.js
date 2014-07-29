var nconf   = require('nconf');
var _       = require('lodash');
var moment  = require('moment');
var Step    = require('step');
var redis   = require('../lib/init-redis');
var debug   = require('debug')('cache');

var getMovies = require('../lib/get-movies');


exports.index = function(req, res){
  // imdb ids are prepended with tt
  var movie_id = 'tt' + req.params.id;

  Step(
    function getData(){
      var step = this;

      getMovies.tmdb(movie_id, function(err, movie) {
        step(err, movie);
      });
    },
    function formatData(err, movie){
      if (err) this(err);

      var runtime = moment.duration(movie.runtime, 'minutes');
      movie.formatted_cast = _.chain(movie.cast)
        .first(3)
        .pluck('name')
        .value()
        .toString().replace(/,/g, ', ');

      movie.formatted_runtime = runtime.hours() + 'h ' + runtime.minutes() + 'm';
      movie.formatted_date = moment(movie.release_date).format('MMMM D, YYYY');

      this(null, movie)
    },
    function render(err, movie){
      // figure out what to do if we can't fetch errors.
      if (err) return err;

      res.render('movie', {
        movie: movie
      });
    }
  );
}