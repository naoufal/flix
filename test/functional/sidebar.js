var webdriverjs = require('webdriverjs');
var should      = require('chai').should();
var assert      = require('chai').assert;
var expect      = require('chai').expect;
var _           = require('lodash');
var app         = require('../../app').app;

describe('Sidebar', function(){
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

  it('should open sidebar when menu button is clicked',function(done) {
    client
      .url('http://localhost:5000')
      .click('#header .btn.menu', function(err){
        expect(err).to.be.null;
      })
      .getAttribute('.sidebar', 'class', function(err, el_class){
        expect(err).to.be.null;
        expect(el_class).to.include('is-visible');
      })
      .pause(900, _.noop)
      .saveScreenshot('./test/screenshots/sidebar-' + Date.now() + '.png', function(err, image) {
        expect(err).to.be.null;
      })
      .call(done);
  });

  it('should dismiss sidebar when overlay is clicked',function(done) {
    client
      .url('http://localhost:5000')
      .click('#header .btn.menu', function(err){
        expect(err).to.be.null;
      })
      .getAttribute('.sidebar', 'class', function(err, el_class){
        expect(err).to.be.null;
        expect(el_class).to.include('is-visible');
      })
      .pause(900, _.noop)
      .click('.overlay', function(err){
        expect(err).to.be.null;
      })
      .getAttribute('.sidebar', 'class', function(err, el_class){
        expect(err).to.be.null;
        expect(el_class).to.not.include('is-visible');
      })
      .pause(900, _.noop)
      .saveScreenshot('./test/screenshots/sidebar-' + Date.now() + '.png', function(err, image) {
        expect(err).to.be.null;
      })
      .call(done);
  });

  it('should update page title and h1 when category is clicked',function(done) {
    client
      .url('http://localhost:5000')
      .click('#header .btn.menu', function(err){
        expect(err).to.be.null;
      })
      .getAttribute('.sidebar', 'class', function(err, el_class){
        expect(err).to.be.null;
        expect(el_class).to.include('is-visible');
      })
      .pause(900, _.noop)
      .click('.category-list li:nth-of-type(3) a', function(err){
        expect(err).to.be.null;
      })
      .getTitle(function(err, title) {
        expect(err).to.be.null;
        expect(title).to.equal('New Releases | Flix');
      })
      .getText('#header .title', function(err, text){
        expect(err).to.be.null;
        expect(text).to.equal('New Releases');
      })
      .pause(900, _.noop)
      .saveScreenshot('./test/screenshots/sidebar-' + Date.now() + '.png', function(err, image) {
        expect(err).to.be.null;
      })
      .call(done);
  });

  after(function(done) {
   client.end(done);
  });
});
