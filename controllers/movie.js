var _       = require('lodash');
var moment  = require('moment');
var async   = require('async');

var getMovies = require('../lib/get-movies');


exports.index = function(req, res){
  // imdb ids are prepended with tt
  var imdb_id = req.params.id;

  async.waterfall([
    function getData(next){
      getMovies.movie(imdb_id, function(err, movie){
        if (err) return next(err);
        next(null, movie);
      });
    },
    function formatData(movie, next){
      var runtime = moment.duration(movie.runtime, 'minutes');

      movie.formatted_cast = _.chain(movie.cast)
        .first(3)
        .pluck('name')
        .value()
        .toString().replace(/,/g, ', ');

      movie.formatted_runtime = runtime.hours() + 'h ' + runtime.minutes() + 'm';
      movie.formatted_date = moment(movie.release_date).format('MMMM D, YYYY');


      /*
        TODO: format videos into URLs with type
      */
      // if (movie.videos.length > 0) {
      //   movie.has_video = true;
      // }
      next(null, movie);
    }
  ], function finish(err, movie){
    // this should point to an error page.
    if (err) return console.log(err);

    res.render('movie', {
      movie: movie
    });
  });
}
