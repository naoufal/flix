var nconf    = require('nconf');
var request  = require('superagent');
var async    = require('async');
var Step     = require('step');
var _        = require('lodash');
var debug    = require('debug')('db');
var redis    = require('../lib/init-redis');
var VError   = require('verror');
var Model    = require('../models');

var RT_URL   = 'http://api.rottentomatoes.com/api/public/v1.0/';
var MDB_URL  = 'http://api.themoviedb.org/3/movie/';

var URL = {
  movie_list: function(list_slug) {
    var list_type = 'movies/';

    if (list_slug == 'new_releases' || list_slug == 'top_rentals') {
      list_type = 'dvds/';
    }

    return RT_URL + 'lists/' + list_type + list_slug + '.json';
  },
  find_movie: function(imdb_id) {
    return MDB_URL + imdb_id;
  }
}



/*
 * Takes movie list slug and fetches movies from Rotten Tomatoes
 * and adds or updates them the Database.
 */
var movieListFetch = function(list_slug, cb){
  async.waterfall([
    function getData(next){
      request
        .get(URL.movie_list(list_slug))
        .query({apikey: nconf.get('ROTTENTOMATOES_KEY')})
        .end(function(err, response){
          if (err) return next(err);

          var response = JSON.parse(response.text);
          next(null, response);
        });
    },
    function formatData(response, next){
      var movies = _.chain(response.movies)
        .map(function(movie){
          // map cast into format of tmdb
          var cast = _.map(movie.abridged_cast, function(actor, i){
            actor = {
              cast_id: null,
              character: actor.characters,
              credit_id: null,
              id: null,
              name: actor.name,
              order: i,
              profile_path: null
            }

            return actor;
          })
          // check if it has imdb id
          movie = new Model.Movie({
            ids: {
              rt: movie.id,
              imdb: movie.alternate_ids ? 'tt' + movie.alternate_ids.imdb : null,
            },
            title: movie.title,
            mpaa_rating: movie.mpaa_rating,
            runtime: movie.runtime,
            ratings: {
              critics_rating: movie.ratings.critics_rating,
              critics_score: movie.ratings.critics_score,
              audience_rating: movie.ratings.audience_rating,
              audience_score: movie.ratings.audience_score,
            },
            poster_url: movie.posters.thumbnail.replace('_tmb.jpg', '_det.jpg').replace('_tmb.png', '_det.png'),
            cast: cast, // setup cast
          });

          return movie;
        })
        // removes movies without imdb id
        .remove(function(movie) { return movie.ids.imdb != null })
        .value();

      next(null, movies);
    },
    function addMoviesToDB(movies, next){
      // add each movie to db if it isn't already in it.
      addEachMovietoDB(movies, next);
    },
    function fetchDBMovies(movie_id_list, next){

      // find each movie from database (with updated data) so we can cache them
      async.map(movie_id_list, function(movie_imdb_id, next_movie){

        Model.Movie.findOne({'ids.imdb': movie_imdb_id}, function(err, db_movie){
          if (err) return next_movie(new VError(err, 'Error querying DB for ' + movie.title + ' (imdb_id: ' + movie.ids.imdb + ')'));

          debug('got movie from db')
          next_movie(null, db_movie);
        });

      }, function afterEach(err, movie_list){
        if (err) return next(new VError(err, 'Could not fetch movies from DB to make movie_list.'));
        next(null, movie_list)
      });
    }

  ], function finish(err, movie_list) {
    if (err) return cb(err);

    cb(null, movie_list);

    var cache_key = 'cache:' + list_slug;
    redisSet(cache_key, movie_list, _.noop);
  });
}



/*
 * Takes movie list slug and fetches movies from Rotten Tomatoes
 * and adds or updates them the Database.
 */
var movieFetch = function(imdb_id, cb){
  // imdb_id = imdb_id.replace(/tt/, '');
  async.waterfall([
    function getData(next){
      request
        .get(URL.find_movie(imdb_id))
        .query({api_key: nconf.get('THEMOVIEDB_KEY')})
        .end(function(err, response){
          if (err) return next(err);
          if (response.error) next(new VError(response.body), 'Movie does not exist');

          response = response.body;
          next(null, response);
        });
    },
    function formatData(response, next){
      var movie = new Model.Movie({
        ids: {
          imdb: response.imdb_id,
          tmdb: response.id
        },
        title: response.title,
        original_title: response.original_title,
        runtime: response.runtime,
        release_date: response.release_date,
        synopsis: response.overview,
        poster_url: 'http://image.tmdb.org/t/p/w185' + response.poster_path,
        banner_url: 'http://image.tmdb.org/t/p/w600' + response.backdrop_path,
        genres: response.genres,
        popularity: response.popularity,
        tagline: response.tagline,
        // videos: [],
        // reviews: [],
      });

      next(null, movie);
    },
    function getAdditionalData(movie, next){
      additionalMovieData(movie.ids.tmdb, function(err, movie_data){
        if (err) next(err);

        movie.crew = movie_data.crew;
        movie.videos = movie_data.videos;

        if (movie_data.cast) movie.cast = movie_data.cast;
        next(null, movie);
      });
    },
    function addMovietoDB(movie, next) {

      Model.Movie.findOne({'ids.imdb': movie.ids.imdb}, function(err, db_movie){
        if (err) return next_movie(new VError(err, 'Error querying DB for ' + movie.title + ' (imdb_id: ' + movie.ids.imdb + ')'));


        // movie already exists
        if (db_movie) {

          movie = {
            ids: {
              rt: db_movie.ids.rt,
              imdb: movie.ids.imdb,
              tmdb: movie.ids.tmdb
            },
            title: movie.title,
            original_title: movie.original_title,
            mpaa_rating: db_movie.mpaa_rating,
            ratings: {
              critics_rating: db_movie.ratings.critics_rating,
              critics_score: db_movie.ratings.critics_score,
              audience_rating: db_movie.ratings.audience_rating,
              audience_score: db_movie.ratings.audience_score,
            },
            runtime: movie.runtime,
            release_date: movie.release_date,
            synopsis: movie.synopsis,
            poster_url: movie.poster_url,
            banner_url: movie.banner_url,
            genres: movie.genres,
            popularity: movie.popularity,
            tagline: movie.tagline,
            cast: movie.cast,
            crew: movie.crew,
            videos: movie.videos,
            reviews: db_movie.reviews,
            updated_ts: new Date().getTime()
          };

          // update movie with TMDB data
          db_movie.update(movie, function (err, num_updated) {
            if (err) return next(new VError(err, 'Could not update ' + movie.title + ' in DB. (imdb_id: ' + movie.ids.imdb + ')'));

            debug('updated ' + movie.title + ' in database');

            //update cache
            var cache_key = 'cache:movie:' + movie.ids.imdb
            redisSet(cache_key, movie, _.noop);

            next(null, movie);
          });
        // movie doesn't already exists
        } else {
          // add it to db
          movie.created_ts = new Date().getTime();
          movie.updated_ts = new Date().getTime();

          movie.save(function (err, product) {
            if (err) return next(new VError(err, 'Could not save ' + movie.title + ' to DB. (imdb_id: ' + movie.ids.imdb + ')'));

            debug('saved ' + movie.title + ' to database');
            next(null, movie);
          });
        }
      });
    }
  ], function finish(err, result) {
    if (err) return cb(new VError(err, 'Could not fetch movie from TMDB'));

    cb(null, result);
  });
}

/*
 * Takes an imdb id and fetches movie credits and videos
 * returns the data in an object containing crew, videos and cast (if applicable) keys.
 */
var additionalMovieData = function(tmdb_id, cb){
  async.parallel([
      function getCredits(done){
        request
          .get(URL.find_movie(tmdb_id) + '/credits')
          .query({api_key: nconf.get('THEMOVIEDB_KEY')})
          .end(function(err, response){
            done(err, response.body);
          });
      },
      function getVideos(done){
        request
          .get(URL.find_movie(tmdb_id) + '/videos')
          .query({api_key: nconf.get('THEMOVIEDB_KEY')})
          .end(function(err, response){
            done(err, response.body);
          });
      }
      // // need to retrive rt id before getting reviews.
      // function getReviews(callback){
      //     setTimeout(function(){
      //         callback(null, 'two');
      //     }, 100);
      // }
  ],
  function afterParallel(err, results){
    // results is equal to: [credits, videos]
    if (err) return cb(new VError(err, 'Could not fetch additional data from TMDB'));

    var movie_data = {};
    var credits = results[0];
    var videos = results[1].results;

    movie_data.crew = credits.crew;
    movie_data.videos = videos;

    if (!_.isEmpty(credits.cast)) {
      movie_data.cast = credits.cast;
    }

    cb(null, movie_data);
  });
}



/*
 * Takes an array of movies.  Adds or updates them in DB.
 * returns an array of imdb_ids
 */
var addEachMovietoDB = function(movies, cb) {
  async.eachSeries(movies, function(movie, next_movie){

    Model.Movie.findOne({'ids.imdb': movie.ids.imdb}, function(err, db_movie){
      if (err) {
        return next_movie(new VError(err, 'Could not fetch ' + movie.title + ' from DB. (imdb_id: ' + movie.ids.imdb + ')'));
      }
      // movie already exists with tmdb data
      if (db_movie && db_movie.ids.tmdb) {
        // update movie with Rotten Tomatoes data
        db_movie.update({
          ids: {
            rt: movie.ids.rt,
            imdb: db_movie.ids.imdb,
            tmdb: db_movie.ids.tmdb
          },
          mpaa_rating: movie.mpaa_rating,
          ratings: {
            critics_rating: movie.ratings.critics_rating,
            critics_score: movie.ratings.critics_score,
            audience_rating: movie.ratings.audience_rating,
            audience_score: movie.ratings.audience_score,
          },
          updated_ts: new Date().getTime()
        }, function (err, num_updated) {
          if (err) return next_movie(new VError(err, 'Could not update ' + movie.title + ' in DB. (imdb_id: ' + movie.ids.imdb + ')'));

          debug('updated ' + movie.title + ' in database');
          next_movie();
        });
      // movie doesn't already exists
      } else {
        // add it to db
        movie.created_ts = new Date().getTime();
        movie.updated_ts = new Date().getTime();
        movie.save(function (err, product) {
          if (err) return next_movie(new VError(err, 'Could not save ' + movie.title + ' to DB. (imdb_id: ' + movie.ids.imdb + ')'));

          debug('saved ' + movie.title + ' in database RT data');

          // console.log(movie.ids.imdb)
          setTimeout(function(){
            movieFetch(movie.ids.imdb, next_movie);
          }, 1000);
          // next_movie();
        });
      }
    });

  }, function afterEach(err){
    if (err) return cb(err);

    var movie_list = _.map(movies, function(movie){
      return movie.ids.imdb;
    });

    cb(null, movie_list);
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

module.exports.movie = movieFetch;
module.exports.movieList = movieListFetch;