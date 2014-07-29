var nconf   = require('nconf');
var _       = require('lodash');
var moment  = require('moment');
var Step    = require('step');
var redis   = require('../lib/init-redis');
var debug   = require('debug')('cache');

var getMovies = require('../lib/get-movies');


exports.home = function(req, res){
  Step(
    function getData(){
      var step = this;

      getMovies.rt('in_theatres', function(err, movies) {
        step(err, movies);
      });
    },
    function formatData(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) console.log(err);
      //format data
      _.each(movies, function(movie) {
        movie.formatted_cast = _.map(movie.cast, function(actor){
          return actor.name;
        }).toString().replace(/,/g, ', ')
      })

      this(err, movies)
    },
    function render(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) return err;

      res.render('movie-list', {
        page_title: 'In Theatres',
        movies: movies
      });
    }
  );
}

exports.in_theatres = function(req, res){
  Step(
    function getData(){
      var step = this;

      getMovies.rt('in_theatres', function(err, movies) {
        step(err, movies);
      });
    },
    function formatData(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) console.log(err);

      //format data
      _.each(movies, function(movie) {
        movie.formatted_cast = _.map(movie.cast, function(actor){
          return actor.name;
        }).toString().replace(/,/g, ', ')
      })

      this(err, movies)
    },
    function render(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) return err;

      res.render('movie-list', {
        page_title: 'In Theatres',
        movies: movies
      });
    }
  );
}

exports.box_office = function(req, res){
  Step(
    function getData(){
      var step = this;

      getMovies.rt('box_office', function(err, movies) {
        step(err, movies);
      });
    },
    function formatData(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) console.log(err);

      //format data
      _.each(movies, function(movie) {
        movie.formatted_cast = _.map(movie.cast, function(actor){
          return actor.name;
        }).toString().replace(/,/g, ', ')
      })

      this(err, movies)
    },
    function render(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) return err;

      res.render('movie-list', {
        page_title: 'Box Office',
        movies: movies
      });
    }
  );
}

exports.new_releases = function(req, res){
  Step(
    function getData(){
      var step = this;

      getMovies.rt('new_releases', function(err, movies) {
        step(err, movies);
      });
    },
    function formatData(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) console.log(err);

      //format data
      _.each(movies, function(movie) {
        movie.formatted_cast = _.map(movie.cast, function(actor){
          return actor.name;
        }).toString().replace(/,/g, ', ')
      })

      this(err, movies)
    },
    function render(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) return err;

      res.render('movie-list', {
        page_title: 'New Releases',
        movies: movies
      });
    }
  );
}

exports.top_rentals = function(req, res){
  Step(
    function getData(){
      var step = this;

      getMovies.rt('top_rentals', function(err, movies) {
        step(err, movies);
      });
    },
    function formatData(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) console.log(err);

      //format data
      _.each(movies, function(movie) {
        movie.formatted_cast = _.map(movie.cast, function(actor){
          return actor.name;
        }).toString().replace(/,/g, ', ')
      })

      this(err, movies)
    },
    function render(err, movies){
      // figure out what to do if we can't fetch errors.
      if (err) return err;

      res.render('movie-list', {
        page_title: 'Top Rentals',
        movies: movies
      });
    }
  );
}