var webdriverjs = require('webdriverjs');
var should      = require('chai').should();
var assert      = require('chai').assert;
var expect      = require('chai').expect;
var _           = require('lodash');
var app         = require('../../app').app;

describe('Movie Info', function(){
  this.timeout(10000);
  var client = {};

  before(function(){
    // init browser
    client = webdriverjs.remote({
      desiredCapabilities: {
        browserName: 'phantomjs'
      }
    });
    client
      .init()
      .windowHandleSize({width: 640, height: 1136})
  });

  it('should display movie view when movie is clicked',function(done) {
    client
      .url('http://localhost:5000')
      .click('.movie-list .movie:nth-of-type(1)', function(err){
        expect(err).to.be.null;
      })
      .getAttribute('div.selected-movie', 'class', function(err, el_class){
        expect(err).to.be.null;
        expect(el_class).to.include('is-visible');
      })
      .pause(900, _.noop)
      .saveScreenshot('./test/screenshots/movie-list-' + Date.now() + '.png', function(err, image) {
        expect(err).to.be.null;
      })
      .call(done);
  });

  it('should dismiss movie view when back button is clicked',function(done) {
    client
      .url('http://localhost:5000')
      .click('.movie-list .movie:nth-of-type(1)', function(err){
        expect(err).to.be.null;
      })
      .getAttribute('div.selected-movie', 'class', function(err, el_class){
        expect(err).to.be.null;
        expect(el_class).to.include('is-visible');
      })
      .pause(600, _.noop)
      .click('.selected-movie .btn.menu', function(err){
        expect(err).to.be.null;
      })
      .getAttribute('div.selected-movie', 'class', function(err, el_class){
        expect(err).to.be.null;
        expect(el_class).not.to.include('is-visible');
      })
      .pause(900, _.noop)
      .saveScreenshot('./test/screenshots/movie-list-' + Date.now() + '.png', function(err, image) {
        expect(err).to.be.null;
      })
      .call(done);
  });

  after(function(done) {
   client.end(done);
  });
});