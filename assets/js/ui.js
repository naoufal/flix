var $        = require('jquery');
var ui       = require('./ui');
var _        = require('lodash');


module.exports = new function(){
  var self = this;
  var WINDOW_WIDTH, WINDOW_HEIGHT;

  this.init = function(){
    self.initWindow();
    self.initMovieList();
    self.initPopup();
    self.initMovieView();
  }

  this.initWindow = function(){
    $(window).resize( _.throttle(function(){
      WINDOW_WIDTH = $(window).width();
      WINDOW_HEIGHT = $(window).height();

      self.initMovieList();
      self.initMovieView();
      self.initPopup();
    }, 100)).resize();
  }

  this.initPopup = function() {
    var $popup = $('.popup');
    var left_offset = (WINDOW_WIDTH - $popup.width() ) / 2;

    $('.popup').css({
      'left': left_offset
    })
  }

  this.initMovieList = function(){
    console.log(WINDOW_HEIGHT - $('#header').height());
    $('.content').height(WINDOW_HEIGHT);
    $('.movie-list').height(WINDOW_HEIGHT - $('#header').height());
  }

  this.initMovieView = function(){
    $('.selected-movie').height(WINDOW_HEIGHT);
    $('.selected-movie__content').height(WINDOW_HEIGHT - $('.selected-movie__header').height());

    // TODO: consider moving this into a bb movie view.
    $('.selected-movie').css({
      'transform': 'translate3d(' + WINDOW_WIDTH + 'px, 0, 0)'
    });
    $('.selected-movie .btn.left').on('click', function(){
      $('.overlay').removeClass('is-visible');
      $('.selected-movie')
        .removeClass('is-visible')
        .css({
          'transform': 'translate3d(' + WINDOW_WIDTH + 'px, 0, 0)'
        });
    })
  }

  this.showPopup = function(title, string) {
    var $popup = $('.popup');
    var $overlay = $('.overlay');

    $popup.find('.popup-content h3').html(title);
    $popup.find('.popup-content p').html(string);
    $popup.addClass('is-visible');
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

  this.showSideMenu = function() {
    var self = this;
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
}