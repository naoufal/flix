var nconf   = require('nconf');
var _       = require('lodash');
var moment  = require('moment');
var Step    = require('step');
var request = require('superagent');
var debug   = require('debug')('cache');
var redis   = require('../lib/init-redis');

var RT_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/';
var MDB_URL = 'http://api.themoviedb.org/3/movie/';

var URL = {
  in_theatres: RT_URL + 'movies/in_theaters.json',
  box_office: RT_URL + 'movies/box_office.json',
  new_releases: RT_URL + 'dvds/new_releases.json',
  top_rentals: RT_URL + 'dvds/top_rentals.json',
  find_movie: function(id) {
    return MDB_URL + id;
  }
}

var tmdb = function(id, cb) {
  Step(
    function redisGet() {
      redis.get('cache:movie:' + id, this)
    },
    function redisReturn(err, movie) {
      if (err) return cb(err);
      if (movie) {
        debug('got (cache:movie:' + id + ') from redis')
        movie = JSON.parse(movie);
        return cb(null, movie);
      }
      this();
    },
    function apiGet() {
      var step = this;

      request
        .get(URL.find_movie(id))
        .query({api_key: nconf.get('THEMOVIEDB_KEY')})
        .end(function(err, response){
          /* TODO: Add better error handling
              - distinguish difference between Flix err, moviedb err
          */
          if (err) return cb(new Error('Could not fetch movies from source.  There may be problems with your Internet connection.'));
          response = response.body;

          formatTMDBResponse(response, function(err, movie){
            if (err) return step(err);
            step(null, movie);
          });
        });
    },
    function cast(err, movie) {
      var step = this;

      request
        .get(URL.find_movie(id) + '/credits')
        .query({api_key: nconf.get('THEMOVIEDB_KEY')})
        .end(function(err, response){
          if (err) return step(err);
          movie.cast = response.body.cast;

          cb(null, movie);
          step(null, movie);
        });
    },
    function redisSet(err, response){
      if (err) return cb(err);
      var response_string = JSON.stringify(response);

      // increase this cache count before pushing to prod
      redis.setex('cache:movie:' + id, 60 * 60 * 3, response_string, this);

      /* TODO:
          - fetch RT critics response concurrently
          - make video request after response is sent, so next people get video
      */
    },
    function redisError(err) {
      if (err) console.error(err);
      debug('set (cache:movie:' + id + ') in redis');
    }
  );
}


var rt = function(category, cb) {
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
        .get(URL[category])
        .query({apikey: nconf.get('ROTTENTOMATOES_KEY')})
        .end(function(err, response){
          /* TODO: Add better error handling
              - distinguish difference between Flix err, RT err
          */
          if (err) return cb(new Error('Could not fetch movies from source.  There may be problems with your Internet connection.'));
          response = JSON.parse(response.text);

          formatRTResponse(category, response, function(err, movies){
            if (err) return cb(err);
            cb(null, movies)
            step(null, movies);
          });
        });
    },
    function redisSet(err, response){
      /* TODO:
          - set individual movies in cache.
            - so we can pull rottenscore when movies endpoint is hit
      */
      if (err) return cb(err);
      var response_string = JSON.stringify(response);
      redis.setex('cache:' + category, 60 * 60 * 3, response_string, this);
    },
    function redisError(err) {
      if (err) console.error(err);
      debug('set (cache:' + category + ') in redis');
    }
  );
}

var formatTMDBResponse = function(response, cb) {
  // TODO: pass rating
  var genres = _.chain(response.genres)
    .first(3)
    .map(function(genre){
      return genre.name;
    })
    .value()
    .toString().replace(/,/g, ', ');
  var spoken_languages = _.chain(response.spoken_languages)
    .first(3)
    .map(function(language){
      return language.name;
    })
    .value()
    .toString().replace(/,/g, ', ');

  var movie = {
    title: response.title,
    genres: genres,
    synopsis: response.overview,
    release_date: response.release_date,
    runtime: response.runtime,
    banner_url: 'http://image.tmdb.org/t/p/w600' + response.backdrop_path,
    poster_url: 'http://image.tmdb.org/t/p/w185' + response.poster_path,
    // extras
    original_title: response.original_title,
    spoken_languages: spoken_languages
  };

  cb(null, movie);
}

var formatRTResponse = function(category, response, cb) {
  var type;
  if (category == 'in_threatres' || category == 'box_office') {
    type = 'theater';
  } else {
    type = 'dvd';
  }

  if (!response.movies) return cb( new Error('We\'re not currently able to get movies'))
  var movies = _.chain(response.movies)
    .map(function(movie){
      return {
        ids: {
          rottentomatoes: movie.id,
          imdb: movie.alternate_ids ? movie.alternate_ids.imdb : null
        },
        title: movie.title,
        year: movie.year,
        mpaa_rating: movie.mpaa_rating,
        runtime: movie.runtime,
        release_date: movie.release_dates[type],
        cast: _.first(movie.abridged_cast, 3),
        synopsis: movie.synopsis,
        poster: movie.posters.thumbnail.replace('_tmb.jpg', '_det.jpg').replace('_tmb.png', '_det.png'),
        ratings: {
          critics: movie.ratings.critics_score,
          audience: movie.ratings.audience_score
        },
        href: {
          self: movie.links.self,
          rottentomatoes: movie.links.alternate
        }
      };
    })
    // removes movies without imdb id
    .remove(function(movie) { return movie.ids.imdb != null })
    .value();

  cb(null, movies)
}

module.exports.rt = rt;
module.exports.tmdb = tmdb;