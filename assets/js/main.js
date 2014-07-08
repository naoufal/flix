var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');
var _History  = require('history');
Backbone.$   = $;

console.log(_History)

// Backbone
Model        = require('./models');
Collection   = require('./collections');
View         = require('./views');

// UI
UI           = require('./ui');

$(function(){
  UI.init();
  // this can probably be setup another way
  var movie_categories = new Collection.Categories([
      {name: 'in-theatres', title: 'In Theatres'},
      {name: 'box-office', title: 'Box Office'},
      {name: 'new-releases', title: 'New Releases'},
      {name: 'top-rentals', title: 'Top Rentals'}
    ]);

  var category_list = new View.CategoryList({
    collection: movie_categories
  });

  var header = new View.Header()

  isUserOnline();
});

// polls to see if user is offline and displays offline notification
var isUserOnline = function() {
  if (navigator.onLine) {
    console.log('online')
    $('.offline').removeClass('is-visible')
  } else {
    console.log('offline')
    $('.offline').addClass('is-visible');
  }
  setTimeout(function(){
    isUserOnline();
  }, 5000)
}