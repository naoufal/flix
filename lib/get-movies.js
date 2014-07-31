var nconf    = require('nconf');
var _        = require('lodash');
var moment   = require('moment');
var async    = require('async');
var Step     = require('step');
var request  = require('superagent');
var debug    = require('debug')('cache');
var redis    = require('../lib/init-redis');
var mongoose = require('mongoose');
var Model    = require('../models');

var RT_URL   = 'http://api.rottentomatoes.com/api/public/v1.0/lists/';
var MDB_URL  = 'http://api.themoviedb.org/3/movie/';

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
    function dbGet() {
      //check what's in the db prior to making a request

      this();
    },

    function apiGet() {
      var step = this;

      request
        .get(URL.find_movie(id))
        .query({api_key: nconf.get('THEMOVIEDB_KEY')})
        .end(function(err, response){
          if (err) return cb(new Error('Could not fetch movies from source.  There may be problems with your Internet connection.'));
          response = response.body;

          formatTMDBResponse(response, function(err, movie){
            if (err) return step(err);
            cb(null, movie);
            step(null, movie);

            var redis_key = 'cache:movie:' + id;
            redisSet(redis_key, movie, _.noop);

          });
        });
    }
    // function redisSet(err, response){
    //   if (err) return cb(err);
    //   var response_string = JSON.stringify(response);

    //   // increase this cache count before pushing to prod
    //   redis.setex('cache:movie:' + id, 60 * 60 * 3, response_string, this);

    //    TODO:
    //       - fetch RT critics response concurrently
    //       - make video request after response is sent, so next people get video

    // },
    // function redisError(err) {
    //   if (err) console.error(err);
    //   debug('set (cache:movie:' + id + ') in redis');
    // }
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
          if (err) return step(err);
          response = JSON.parse(response.text);

          formatRTResponse(category, response, function(err, movies){
            if (err) return cb(err);

            cb(null, movies)

            // add movies to redis
            var redis_key = 'cache:' + category;
            redisSet(redis_key, movies, _.noop);
          });
        });
    },
    function dbGet(err){
      mongoose.connect(nconf.get('MONGO_URL')); // add this to config
      var slug = category.replace(/_/, '-');

      Model.MovieList.findOne({ slug: slug}, function (err, movie_list) {
        if (err || movie_list == null) {
          mongoose.connection.close();
          cb(new Error('Could not retrieve movie'));
        }
        cb(null, movie_list.movies);

        console.log('got movies from database')
        // no redis set after fetching from db.

        mongoose.connection.close();
      });
    }
  );
}

var formatTMDBResponse = function(response, cb) {
  var movie;

  Step(
    function formatMovies(){
      movie = new Model.Movie({
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
        links: {
          // reviews: movie.links.reviews,
          videos: null, //might be able to build these with the imdb id
          credits: null, //might be able to build these with the imdb id
        },
        created_ts: new Date().getTime(),
        updated_ts: new Date().getTime()
      });

      this(null, movie);
    },
    function getAdditionalInfo(err, movie){
      var step = this;

      async.parallel([
          function getCredits(done){
            request
              .get(URL.find_movie(response.id) + '/credits')
              .query({api_key: nconf.get('THEMOVIEDB_KEY')})
              .end(function(err, response){
                done(err, response.body);
              });
          },
          function getVideos(done){
            request
              .get(URL.find_movie(response.id) + '/videos')
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
        if (err) return cb(err);

        var credits = results[0];
        var videos = results[1].results;

        movie.crew = credits.crew;
        movie.videos = videos;

        if (!_.isEmpty(credits.cast)) {
          movie.cast = credits.cast;
        }
        cb(null, movie);
        step(null, movie);
      });
    },
    function addMovieToDB(err, movie) {
      var step = this;
      if (err) this(err);

      mongoose.connect(nconf.get('MONGO_URL'));
      Model.Movie.findOne({'ids.imdb': movie.ids.imdb}, function(err, db_movie){
        if (err) return step(err);

        if (db_movie) {
          db_movie.update({
            ids: {
              rt: db_movie.ids.rt,
              imdb: movie.ids.imdb,
              tmdb: movie.ids.tmdb
            },
            title: movie.title,
            original_title: movie.original_title,
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
            // reviews: [],
            links: {
              // reviews: movie.links.reviews,
              videos: null, //might be able to build these with the imdb id
              credits: null, //might be able to build these with the imdb id
            },
            updated_ts: new Date().getTime()
          }, function (err, num_updated) {
            if (err) return step(err);

            console.log('updated ' + num_updated + ' movie');
            step();
          });
        } else {
          // unlikely scenario, will only happen if some hits it url directly using imdb_id.
          movie.save(function (err, product) {
            if (err) return next_movie(new Error('error adding movie to db'));
            console.log('movie added to database');
            step();
          });
        }
      });
    },
    function closeDBConnection() {
      mongoose.connection.close();
    }

  );

  // // TODO: pass rating
  // var genres = _.chain(response.genres)
  //   .first(3)
  //   .map(function(genre){
  //     return genre.name;
  //   })
  //   .value()
  //   .toString().replace(/,/g, ', ');
  // var spoken_languages = _.chain(response.spoken_languages)
  //   .first(3)
  //   .map(function(language){
  //     return language.name;
  //   })
  //   .value()
  //   .toString().replace(/,/g, ', ');

  // var movie = {
  //   title: response.title,
  //   genres: genres,
  //   synopsis: response.overview,
  //   release_date: response.release_date,
  //   runtime: response.runtime,
  //   banner_url: 'http://image.tmdb.org/t/p/w600' + response.backdrop_path,
  //   poster_url: 'http://image.tmdb.org/t/p/w185' + response.poster_path,
  //   // extras
  //   original_title: response.original_title,
  //   spoken_languages: spoken_languages
  // };

  // cb(null, movie);
}

var formatRTResponse = function(category, response, cb) {
  var type;

  var CATEGORY_TITLES = {
    in_threatres: 'In Theatres',
    box_office: 'Box Office',
    new_releases: 'New Releases',
    top_rentals: 'Top Rentals'
  };

  if (category == 'in_threatres' || category == 'box_office') {
    type = 'theater';
  } else {
    type = 'dvd';
  }

  if (!response.movies) return cb( new Error('We\'re not currently able to get movies'))

  Step(
    function formatMovies(){
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
              tmdb: null, // remove after setting up tmdb update
            },
            title: movie.title,
            original_title: null, // remove after setting up tmdb update
            mpaa_rating: movie.mpaa_rating,
            runtime: movie.runtime,
            release_date: null,
            synopsis: null,
            ratings: {
              critics_rating: movie.ratings.critics_rating,
              critics_score: movie.ratings.critics_score,
              audience_rating: movie.ratings.audience_rating,
              audience_score: movie.ratings.audience_score,
            },
            poster_url: movie.posters.thumbnail.replace('_tmb.jpg', '_det.jpg').replace('_tmb.png', '_det.png'),
            banner_url: null,
            cast: cast, // setup cast
            genres: [],
            videos: [],
            reviews: [],
            links: {
              reviews: movie.links.reviews,
              videos: null, //might be able to build these with the imdb id
              credits: null, //might be able to build these with the imdb id
            },
            created_ts: new Date().getTime(),
            updated_ts: new Date().getTime()
          });

          return movie;
        })
        // removes movies without imdb id
        .remove(function(movie) { return movie.ids.imdb != null })
        .value();

      cb(null, movies);
      this(null, movies)
    },
    function addMoviesToDB(err, movies){
      var step = this;
      if (err) return console.log(new Error('Movies could not be formatted.'))

      async.each(movies, function(movie, next_movie){
        Model.Movie.findOne({'ids.imdb': movie.ids.imdb}, function(err, db_movie){
          if (err) return step(err);

          // if movie is in db
          if (db_movie) {
            console.log('Movie already in DB')
            next_movie();
          } else {
            movie.save(function (err, product, numberAffected) {
              if (err) return next_movie(new Error('error adding movie to db'));

              console.log('movie added to database');
              next_movie();
            });
          }
        })
      }, function(err){
        if (err) return step(err)

        console.log('movies were added to the db.');
        step(null, movies);
      })
    },
    function addMovieListToDB(err, movies) {
      var step = this;
      if (err) this(err);

      var slug = category.replace(/_/, '-');

      Model.MovieList.findOne({slug: slug}, function(err, db_movielist) {
        if (err) return step(err);

        if (db_movielist) {
          db_movielist.update({
            movies: movies,
            updated_at: new Date().getTime()
          }, function (err, num_updated) {
            if (err) return step(err);

            console.log('updated ' + num_updated + ' movie list');
            step();
          });
        } else {
          Model.MovieList.create({
            name: CATEGORY_TITLES[category],
            slug: slug,
            movies: movies,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime()
          }, function (err) {
            if (err) return step(err);
            console.log('movie list added to database');
            step();
          })
        }
      });
    },
    function closeDBConnection(){
      mongoose.connection.close();
    }
  );
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

module.exports.rt = rt;
module.exports.tmdb = tmdb;