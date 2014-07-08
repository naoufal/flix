var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');
var History  = require('history');
Backbone.$   = $;

// Backbone
Model        = require('./models');
Collection   = require('./collections');
View         = require('./views');

// UI
UI           = require('./ui');

var CATEGORIES = [
    {name: 'in-theatres', title: 'In Theatres'},
    {name: 'box-office', title: 'Box Office'},
    {name: 'new-releases', title: 'New Releases'},
    {name: 'top-rentals', title: 'Top Rentals'}
  ];

$(function(){
  var initial_route = window.location.pathname.replace('/', '');
  var initial_category = _.where(CATEGORIES, {name: initial_route})[0];

  var movie_categories = new Collection.Categories(CATEGORIES);
  var category_list = new View.CategoryList({
    collection: movie_categories
  });
  var header = new View.Header();

  category_list.getMovies(initial_category.name, initial_category.title);
  isUserOnline();
  UI.init();
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