'use strict';

var nconf    = require('nconf');
var app      = require('../app').app;
var request  = require('supertest')(app);
var should   = require('chai').should();
var nock     = require('nock');
var _        = require('lodash');

var BASE_URL = 'http://api.rottentomatoes.com';
var BASE_PATH = '/api/public/v1.0/lists';
var RT_KEY = nconf.get('ROTTENTOMATOES_KEY');

var URL = {
  in_theatres: BASE_PATH + '/movies/in_theaters.json?apikey=' + RT_KEY,
  box_office: BASE_PATH + '/movies/box_office.json?apikey=' + RT_KEY,
  new_releases: BASE_PATH + '/dvds/new_releases.json?apikey=' + RT_KEY,
  top_rentals: BASE_PATH + '/dvds/top_rentals.json?apikey=' + RT_KEY
}

// get category endpoints
var category_endpoints = _.chain(app.routes.get)
  .pluck('path')
  .remove(function(path) {
    var category_regex = new RegExp('/api/category/')
    var is_category = category_regex.test(path);

    if (is_category) return path;
  })
  .value();

describe('Endpoints', function(){
  // for each category endpoint
  _.each(category_endpoints, function(endpoint){
    var endpoint_name = endpoint.replace('/api/category/', '');
    var endpoint_key = endpoint_name.replace('-', '_');

    describe(endpoint, function(){
      it('should return status code 200', function(done){
        nock(BASE_URL)
          .get(URL[endpoint_key])
          .reply(200, require('./fixtures/' + endpoint_name + '.json'))

        request
          .get('/api/category/' + endpoint_name)
          .expect(200)
          .end(function(err, res){
            // console.log(res.req)
            done();
          });
      });

      it('should return a timestamp', function(done){
        nock(BASE_URL)
          .get(URL[endpoint_key])
          .reply(200, require('./fixtures/' + endpoint_name + '.json'))

        request
          .get('/api/category/' + endpoint_name)
          .expect(200)
          .end(function(err, res){
            res.body.should.include.key('timestamp');
            done();
          });
      });

      it('should return have a movies arrray', function(done){
        nock(BASE_URL)
          .get(URL[endpoint_key])
          .reply(200, require('./fixtures/' + endpoint_name + '.json'))

        request
          .get('/api/category/' + endpoint_name)
          .expect(200)
          .end(function(err, res){
            res.body.movies.should.be.an('array');
            done();
          });
      });
    });
  });
});