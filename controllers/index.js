var nconf   = require('nconf');
var _       = require('lodash');
var moment  = require('moment');
var Step    = require('step');
var request = require('superagent');
var nconf   = require('nconf');
var redis   = require('../lib/init-redis');
var debug   = require('debug')('cache');

var BASE_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/';
var RT_KEY = nconf.get('ROTTENTOMATOES_KEY');



var URL = {
  in_theatres: BASE_URL + 'movies/in_theaters.json?apikey=',
  box_office: BASE_URL + 'movies/box_office.json?apikey=',
  new_releases: BASE_URL + 'dvds/new_releases.json?apikey=',
  top_rentals: BASE_URL + 'dvds/top_rentals.json?apikey='
}

exports.in_theatres = function(req, res){
  getResponse('in_theatres', function(err, movies) {
    if (err) return res.json({error: err});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
};

exports.box_office = function(req, res){
  getResponse('box_office', function(err, movies) {
    if (err) return res.json({error: err});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
};

exports.new_releases = function(req, res){
  getResponse('new_releases', function(err, movies) {
    if (err) return res.json({error: err});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
};

exports.top_rentals = function(req, res){
  getResponse('top_rentals', function(err, movies) {
    if (err) return res.json({error: err});
    res.json({timestamp: new Date().getTime(), movies: movies});
  });
}




var getResponse = function(category, cb) {
  Step(
    function redisGet() {
      redis.get('cache:' + category, this)
    },
    function redisReturn(err, movies) {
      if (err) return cb(err);
      if (movies) {
        debug('got (cache:' + category + ') from redis')
        movies = JSON.parse(movies);
        return cb(null, movies);
      }
      this();
    },
    function apiGet() {
      var step = this;
      request
        .get(URL[category] + nconf.get('ROTTENTOMATOES_KEY'))
        .end(function(err, response){
          if (err) return cb(err);
          response = JSON.parse(response.text);

          formatMovieResponse(response, function(err, movies){
            if (err) return cb(err);
            cb(null, movies)
            step(null, movies);
          });
        });
    },
    function redisSet(err, response){
      if (err) return cb(err);
      var response_string = JSON.stringify(response);
      redis.setex('cache:' + category, 60 * 60 * 3, response_string, this);
    },
    function redisError(err) {
      if (err) console.error(err);
      debug('set (cache:' + category + ') in redis')
    }
  );
}

var formatMovieResponse = function(response, cb) {
  if (!response.movies) return cb( new Error('We\'re not currently able to get movies'))
  var movies = _.map(response.movies, function(movie){
    return {
      ids: {
        rottentomatoes: movie.id,
        imdb: movie.alternate_ids.imdb
      },
      title: movie.title,
      year: movie.year,
      mpaa_rating: movie.mpaa_rating,
      runtime: movie.runtime,
      releases_dates: movie.releases_dates,
      cast: _.first(movie.abridged_cast, 3),
      synopsis: movie.synopsis,
      poster: movie.posters.thumbnail.replace('_tmb.jpg', '_det.jpg'),
      ratings: {
        critics: movie.ratings.critics_score,
        audience: movie.ratings.audience_score
      },
      href: {
        self: movie.links.self,
        rottentomatoes: movie.links.alternate
      }
    };
  });

  cb(null, movies)
}