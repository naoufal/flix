var $        = require('jquery');
var ui       = require('./ui');
var _        = require('lodash');


module.exports = new function(){
  var self = this;

  this.init = function(){
    self.initWindow();
    self.initMovieList();
    self.initPopup();
    self.initMovieView();
  }

  this.initWindow = function(){
    $(window).resize( _.throttle(function(){
      self.windowWidth = $(window).width();
      self.windowHeight = $(window).height();

      self.initMovieList();
      self.initMovieView();
      self.initPopup();
    }, 100)).resize();
  }

  this.initPopup = function() {
    var $popup = $('.popup');
    var left_offset = (self.windowWidth - $popup.width() ) / 2;

    $('.popup').css({
      'left': left_offset
    })
  }

  this.initMovieList = function(){
    $('.content').height(self.windowHeight);

    if ($('.movie-list').hasClass('is-offline')) {
      return $('.movie-list').height(self.windowHeight - $('#header').height() - 58);
    }

    // handles bottom padding on medium/large
    if (self.windowWidth <= 640 ) {
      $('.movie-list').height(self.windowHeight - $('#header').height());
    } else {
      $('.movie-list').height(self.windowHeight - $('#header').height() - 27);
    }

  }

  this.initMovieView = function(){
    $('.selected-movie').height(self.windowHeight);
    $('.selected-movie__content').height(self.windowHeight - $('.selected-movie__header').height());
  }

  this.showPopup = function(title, string) {
    var $popup = $('.popup');
    var $overlay = $('.overlay');
    var template = require("../templates/popup.hbs");


    // append data to template
    $popup
      .html(template({
        title: title,
        message: string
      }))
      .addClass('is-visible');

    $overlay.addClass('is-visible');
    $overlay.on('click', function(){
      self.hidePopup();
    })
  }

  this.hidePopup = function() {
    var $popup = $('.popup');
    var $overlay = $('.overlay');

    $popup.removeClass('is-visible');
    $overlay.removeClass('is-visible');
  }

  this.showAlert = function(title, string) {
    var $alert = $('.alert');
    var $movie_list = $('.movie-list');
    var template = require("../templates/alert.hbs");

    // append data to template
    $alert
      .html(template({
        title: title,
        message: string
      }))
      .addClass('is-visible');
    $('.movie-list').addClass('is-offline');

  }

  this.hideAlert = function() {
    var $alert = $('.alert');
    var $movie_list = $('.movie-list');

    $alert.removeClass('is-visible');
    $movie_list.removeClass('is-offline');
  }

  this.showSideMenu = function() {
    var $sidebar = $('.sidebar');
    var $overlay = $('.overlay');

    $sidebar.addClass('is-visible');
    $overlay.addClass('is-visible').on('click', function(){
      self.hideSideMenu();
    });
  }

  this.hideSideMenu = function() {
    var $sidebar = $('.sidebar');
    var $overlay = $('.overlay');

    $sidebar.removeClass('is-visible');
    $overlay.removeClass('is-visible').off();
  }

  // variables
  this.windowWidth = $(window).width();
  this.windowHeight = $(window).height();
}