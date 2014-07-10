var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');
require('history'); // There's surely a better way of doing this.

module.exports.MovieList = Backbone.View.extend({
  el: '.movie-list',
  initialize: function() {
    _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods
    this.collection.bind('reset', this.render);
  },
  render: function(){
    var self = this;
    self.$el.empty();
    var count = 0;
    _.each(this.collection.models, function(movie) {
      var itemView = new View.MovieItem({model: movie});
      itemView.render();
      self.$el.append(itemView.el);
      setTimeout(function(){
        $('li[data-movie-cid="' + itemView.model.cid + '"]').addClass('is-visible');
      }, 60 * count);
      count++;
    });
  }
});



module.exports.MovieItem = Backbone.View.extend({
  tagName: 'li',
  initialize: function() {
    this.model.on('change', this.render, this);
  },
  render: function(){
    var actors = _.map(this.model.get('cast'), function(actor){
      return actor.name;
    }).toString().replace(/,/g, ', ')

    $(this.el).empty();
    var poster = '<div class="movie-poster"> <img src="' + this.model.get('poster') + '"> <div class="inset-shadow"></div></div>';
    // var poster = '<img class="movie-poster" src="' + '">';
    var title = '<div class="movie-title">' + this.model.get('title') + '</div>';
    var cast = '<div class="movie-cast">' + actors + '</div>';
    var info = '<div class="movie-info">' + title + cast + '</div>';
    var html = '<a class="movie">' + poster + info + '</a>';
    $(this.el).attr('data-movie-cid', this.model.cid).append(html);
  }
});



module.exports.CategoryList = Backbone.View.extend({
  el: '.category-list',
  initialize: function() {
    _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods
    this.render();
    this.collection.bind('reset', this.render);
  },
  render: function(){
    var self = this;
    self.$el.empty();
    _.each(this.collection.models, function(category) {
      var itemView = new View.CategoryItem({model: category, parent: self});
      itemView.render();
      self.$el.append(itemView.el);
    });
  },
  hideMenu: function(){
    $('.sidebar').removeClass('is-visible');
  },
  getMovies: function(category_name, category_title){
    var cache_key = category_name.replace('-', '_');
    var cache_response = localStorage.getItem(cache_key);
    // if cache response, parse it.
    if (cache_response) {
      // console.log('has cache');
      cache_response = JSON.parse(cache_response);

      this.isTimestampExpired(cache_response, category_name);
    } else if (!cache_response && !navigator.onLine) {
      UI.showPopup('You\'re offline', 'This movie category is not available in offline mode.');
    } else {
      // console.log('no cached');
      var movie_collection = new Collection.Movies({category: category_name});
      var movie_list = new View.MovieList({
        collection: movie_collection
      });
    }

    $('#header .title').html(category_title)
    this.hideMenu();
  },
  isTimestampExpired: function(cache_response, category) {
    var TIMESTAMP_OFFSET = 30 * 60 * 1000;
    var timestamp_diff = new Date().getTime() - cache_response.timestamp;
    var cached_is_expired = timestamp_diff > TIMESTAMP_OFFSET;
    var movie_collection;

    if (cached_is_expired && navigator.onLine) {
      movie_collection = new Collection.Movies({category: category});
      // console.log('old cache');
    } else {
      movie_collection = new Collection.Movies(cache_response.movies);
      // console.log('cache');
    }

    var movie_list = new View.MovieList({
      collection: movie_collection
    });
    movie_list.render();
  }
});



module.exports.CategoryItem = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.parent = options.parent;
  },
  render: function(){
    $(this.el).empty();
    var html = '<a class="category" href="/' + this.model.get('name') + '">' + this.model.get('title') + '</a>';
    $(this.el).append(html);
  },
  events: {
    'click .category': 'selectCategory'
  },
  selectCategory: function(e) {
    e.preventDefault();
    var collection = this.model.collection;
    var self = this;

    // set selected
    collection.each(function(category){
      if (category.get('name') == self.model.get('name')) {
        category.set('selected', true);
      } else {
        category.set('selected', false);
      }
    });
    this.parent.getMovies(this.model.get('name'), this.model.get('title'));
    this.setPushState();
  },
  setPushState: function(){
    var model_name = this.model.get('name');
    var title = this.model.get('title') + ' | Flix'
    History.pushState({
      value: model_name
    }, title, model_name);
  }
});



module.exports.Header = Backbone.View.extend({
  el: '#header',
  initialize: function (options) {
  },
  render: function(){

  },
  events: {
    'click .btn.menu': 'showMenu',
    'click .btn.search': 'showSearch'
  },
  showMenu: function(e) {
    e.preventDefault();
    var $sidebar = $('.sidebar');
    var $overlay = $('.overlay');

    if ($sidebar.hasClass('is-visible')) {
      $sidebar.removeClass('is-visible');
      $overlay.off('click', function(){
        $sidebar.removeClass('is-visible');
      });
    } else {
      $sidebar.addClass('is-visible');
      $overlay.on('click', function(){
        $sidebar.removeClass('is-visible');
      });
    }
  }
});