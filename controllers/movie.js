var _       = require('lodash');
var moment  = require('moment');
var async   = require('async');

var getMovies = require('../lib/get-movies');
var formatVideo = require('../lib/format-video');

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

      // if movie has videos format them
      if (movie.videos.length > 0) {
        var latest_video = _.first(movie.videos);
        movie.video = formatVideo.index(latest_video);
      }

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
