var $        = require('jquery');
var ui       = require('./ui');
var _        = require('lodash');


module.exports = new function(){
  var self = this;
  var WINDOW_WIDTH, WINDOW_HEIGHT;

  this.init = function(){
    self.initWindow();
    self.initPopup();
  }

  this.initWindow = function(){
    $(window).resize( _.throttle(function(){
      WINDOW_WIDTH = $(window).width();
      WINDOW_HEIGHT = $(window).height();

      self.initPopup();
      self.initMovieView();
    }, 100)).resize();
  }

  this.initPopup = function() {
    var $popup = $('.popup');
    var left_offset = (WINDOW_WIDTH - $popup.width() ) / 2;

    $('.popup').css({
      'left': left_offset
    })
  }

  this.initMovieView = function(){
    $('.selected-movie').height(WINDOW_HEIGHT);

    // TODO: consider moving this into a bb movie view.
    $('.selected-movie .btn.left').on('click', function(){
      $('.selected-movie').removeClass('is-visible');
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
}
//   $('#album-view').css({
//    'transform': 'translate3d(' + ui.windowWidth() + ', 0, 0)'
//   });
//   $('#track-view').css({
//    'transform': 'translate3d(' + ui.windowWidth() + ', 0, 0)'
//   });

//   //Hide Player
//   $('#player').css({
//    'transform': 'translate3d(0, ' + ($('#player').height() + 1) + 'px, 0)'
//   });

//   // Header Button
//   $('.js--header-left').on('click', function(e){
//     e.preventDefault();
//     if ($('.js--header-left').hasClass('is-menu') && $('#main').hasClass('is-visible')) {
//       ui.showMenu();
//     } else if ($('.js--header-left').hasClass('is-menu') && $('#main').hasClass('is-hidden')) {
//       ui.hideMenu();
//     } else if ($('#track-view').hasClass('is-visible') && $('.js--header-left').hasClass('is-back')) {
//       ui.hideTrackView();
//     } else if ($('#album-view').hasClass('is-visible') && $('.js--header-left').hasClass('is-back')) {
//       ui.hideAlbumView();
//     }
//   })


//   // Resize functions
//   $(window).on('resize', function(){
//     if ($('#artist-view').hasClass('is-hidden')){
//       ui.showAlbumView();
//     }
//   });
// }

// // module.exports.windowWidth = function(){
// //   return $(window).width() + 1;
// // }


// // // Views
// // module.exports.showAlbumView = function(){
// //   $('#album-view').addClass('ss-animate  is-visible').css({
// //    'transform': 'translate3d(0, 0, 0)'
// //   });
// //   $('#artist-view').addClass('ss-animate  is-hidden').css({
// //    'transform': 'translate3d(-' + ui.windowWidth() / 2 + 'px, 0, 0)'
// //   });
// //   $('.js--header-left i').removeClass('icon-reorder').addClass('icon-chevron-left');
// //   $('.js--header-left').removeClass('is-menu').addClass('is-back');
// // }


// // module.exports.showArtistView = function(){
// //   $('#track-view').addClass('ss-animate  is-visible').css({
// //    'transform': 'translate3d(0, 0, 0)'
// //   });
// //   $('#album-view').removeClass('is-visible').addClass('is-hidden').css({
// //    'transform': 'translate3d(-' + ui.windowWidth() / 2 + 'px, 0, 0)'
// //   });
// // }



// // module.exports.hideTrackView = function(){
// //   $('#track-view').removeClass('is-visible').addClass('ss-animate  is-hidden').css({
// //    'transform': 'translate3d(' + ui.windowWidth() + 'px, 0, 0)'
// //   });
// //   $('#album-view').removeClass('is-hidden').addClass('ss-animate  is-visible').css({
// //    'transform': 'translate3d(0, 0, 0)'
// //   });
// // }


// // module.exports.hideAlbumView = function(){
// //   $('#album-view').removeClass('is-visible').addClass('ss-animate').css({
// //    'transform': 'translate3d(' + ui.windowWidth() + 'px, 0, 0)'
// //   });
// //   $('#artist-view').removeClass('is-hidden').addClass('ss-animate  is-visible').css({
// //    'transform': 'translate3d(0, 0, 0)'
// //   });
// //   $('.js--header-left i').removeClass('icon-chevron-left').addClass('icon-reorder');
// //   $('.js--header-left').removeClass('is-back').addClass('is-menu');
// // }

// // // Player
// // module.exports.showPlayer = function(){
// //   $('#player').removeClass('is-visible').addClass('ss-animate').css({
// //    'transform': 'translate3d(0, 0, 0)'
// //   });
// // }

// // module.exports.hidePlayer = function(){
// //   $('#player').removeClass('is-visible').addClass('ss-animate').css({
// //    'transform': 'translate3d(0, ' + $('#player').height + 'px, 0)'
// //   });
// // }


// // // Menu
// // module.exports.showMenu = function(){
// //   $('#main').removeClass('is-visible').addClass('ss-animate  is-hidden').css({
// //    'transform': 'translate3d(' + (ui.windowWidth() - 60) + 'px, 0, 0)'
// //   });
// //   $('.js--header-left i').removeClass('icon-reorder').addClass('icon-chevron-left');
// // }



// // module.exports.hideMenu = function(){
// //   $('#main').removeClass('is-hidden').addClass('ss-animate  is-visible').css({
// //    'transform': 'translate3d(0, 0, 0)'
// //   });
// //   $('.js--header-left i').removeClass('icon-chevron-left').addClass('icon-reorder');
// // }
