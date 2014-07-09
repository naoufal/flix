var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');
Backbone.$   = $;


// Backbone
Model        = require('./models');
Collection   = require('./collections');
View         = require('./views');


$(function(){
  Flix.init();
});

Flix = new function(){
  'use strict';
  var self = this;
  var CATEGORIES = [
      {name: 'in-theatres', title: 'In Theatres'},
      {name: 'box-office', title: 'Box Office'},
      {name: 'new-releases', title: 'New Releases'},
      {name: 'top-rentals', title: 'Top Rentals'}
    ];

  this.init = function(){
    self.initLayout();
    self.initHistory();
    self.isUserOnline();
  }

  this.initLayout = function() {
    var movie_categories = new Collection.Categories(CATEGORIES);
    var category_list = new View.CategoryList({
      collection: movie_categories
    });
    var header = new View.Header();
    initialRoute(category_list);
  }

  this.initHistory = function() {
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
      var State = History.getState(); // Note: We are using History.getState() instead of event.state
      console.log(State);
    });
  }

  // polls to see if user is offline and displays offline notification
  this.isUserOnline = function() {
    if (navigator.onLine) {
      self.config.isOnline = true;
      $('.offline').removeClass('is-visible');
    } else {
      self.config.isOnline = false;
      $('.offline').addClass('is-visible');
    }

    setTimeout(function(){
      self.isUserOnline();
    }, 3000)
  }

  // Global Variables
  this.config = {
    isOnline: true
  };

  // Private Functions
  var initialRoute = function(category_list) {
    var initial_route = window.location.pathname.replace('/', '');
    var initial_category = _.where(CATEGORIES, {name: initial_route})[0] || CATEGORIES[0];

    category_list.getMovies(initial_category.name, initial_category.title);
  }
}

