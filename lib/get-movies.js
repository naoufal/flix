var nconf    = require('nconf');
var _        = require('lodash');
var async    = require('async');
var Step     = require('step');
var debug    = require('debug')('cache');
var debugDB  = require('debug')('db');
var VError   = require('verror');
var redis    = require('../lib/init-redis');
var Model    = require('../models');

var externalFetch = require('./external-fetch');



var movie = function(imdb_id, cb) {
  var is_cached;

  async.waterfall([
    function redisGet(next){
      redis.get('cache:movie:' + imdb_id, next);
    },
    function redisReturn(movie, next){
      if (movie) {
        debug('got (cache:movie:' + imdb_id + ') from redis')
        movie = JSON.parse(movie);

        // if it has tmdb data
        if (movie.ids.tmdb) {
          console.log(movie.ids.tmdb)
          is_cached = true;
          return next(null, movie);
        // if it doesn't have imdb data
        } else {
          console.log('doesn\'t have tmdb data');
          return externalFetch.movie(imdb_id, next)
        }
      }

      // no error, no movie
      next(null, null);
    },
    function getMovieFromDB(movie, next){
      // if movie was in cache jump to finish
      if (movie) {
        return next(null, movie);
      }

      Model.Movie.findOne({'ids.imdb': imdb_id}, function(err, db_movie){
        if (err) return next(new VError(err, 'Error querying DB for ' + movie.title + ' (imdb_id: ' + movie.ids.imdb + ')'));

        // movie already exists
        if (db_movie) {
          debugDB('got movie from db')

          if (db_movie.ids.tmdb) {
            return next(null, db_movie);
          }
          console.log('doesn\'t have tmdb data');
        }
        externalFetch.movie(imdb_id, next);
      });
    }

  ], function finish(err, movie) {
    if (err) return cb(new VError(err, 'Error fetching movie data'));

    cb(null, movie);

    if (!is_cached) {
      var cache_key = 'cache:movie:' + imdb_id;
      redisSet(cache_key, movie, _.noop);
    }
  });
}



var movieList = function(list_slug, cb){
  async.waterfall([
    function redisGet(next){
      redis.get('cache:' + list_slug, next);
    },
    function redisReturn(movie_list, next){
      if (movie_list) {
        debug('got (cache:' + list_slug + ') from redis')
        movie_list = JSON.parse(movie_list);
        return cb(null, movie_list);
      }

      next(null);
    },
    function getMovieListExternally(next){
      externalFetch.movieList(list_slug, function(err, movie_list){
        // if external server is unreachable, get Movie List from DB.
        if (err) {

          Model.MovieList.findOne({ slug: list_slug}, function (err, movie_list) {

            if (err) {
              return next(new VError(err, 'Error querying DB for ' + list_slug));
            } else if (movie_list == null) {
              return next(new VError('No ' + list_slug + ' list was found in database.'));
            }

            // return movie list from db.
            next(null, movie_list.movie_list);
            debugDB('got movie list from database')
            // no redis set after fetching from db.
          });
        } else {
          // return external movie list.
          next(null, movie_list);
        }

      })
    }

  ], function finish(err, movie_list) {
    if (err) return cb(err);

    cb(null, movie_list);

    //cache movie list
    var cache_key = 'cache:' + list_slug;
    redisSet(cache_key, movie_list, _.noop);
  });
}


var redisSet = function(key, value, cb){
  Step(
    function redisSet(){
      var value_string = JSON.stringify(value);
      redis.setex(key, 60 * 60 * 3, value_string, this);
    },
    function redisError(err) {
      if (err) console.error(err);
      debug('set (' + key + ') in redis');
      cb(err);
    }
  );
}

module.exports.movie = movie;
module.exports.movieList = movieList;
