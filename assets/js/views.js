var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');
var moment   = require('moment');
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
  },
  events: {
    'click': 'showSelectedMovie'
  },
  showSelectedMovie: function(e){
    $('.selected-movie').addClass('is-visible').css({
      'transform': 'translateY(-56px)'
    });

    $('.overlay').addClass('is-visible');
    var imdb_id = 'tt' + this.model.get('ids').imdb;
    var selected_movie = new Model.DetailedMovie({
      id: imdb_id,
      title: this.model.get('title'),
      cast: this.model.get('cast'),
      runtime: this.model.get('runtime')
    });
    var selected_movie_view = new View.SelectedMovie({
      model: selected_movie
    });
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
  getMovies: function(category_name, category_title){
    var cache_key = category_name.replace('-', '_');
    var cache_response = localStorage.getItem(cache_key);
    // if cache response, parse it.
    if (cache_response) {
      // console.log('has cache');
      cache_response = JSON.parse(cache_response);

      this.isTimestampExpired(cache_response, category_name);
      UI.hideSideMenu();
    } else if (!cache_response && !navigator.onLine) {
      $('.sidebar').removeClass('is-visible');
      UI.showPopup('You\'re offline', 'This movie category is not available in offline mode.');
    } else {
      // console.log('no cached');
      var movie_collection = new Collection.Movies({category: category_name});
      var movie_list = new View.MovieList({
        collection: movie_collection
      });
      UI.hideSideMenu();
    }

    $('#header .title').html(category_title)
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
    'click .btn.menu': 'showSideMenu'
  },
  showSideMenu: function(e) {
    e.preventDefault();
    UI.showSideMenu();
  }
});



module.exports.SelectedMovie = Backbone.View.extend({
  el: '.selected-movie',
  initialize: function() {
    this.model.on('change', this.render, this);
  },
  render: function(){
    var cast = _.map(this.model.get('cast'), function(actor){
      return actor.name;
    }).toString().replace(/,/g, ', ');

    var banner_url = this.model.get('banner_url');
    var release_date = this.model.get('release_date');
    var formatted_date = moment(release_date).format('MMMM D, YYYY');
    var runtime = moment.duration(this.model.get('runtime'), 'minutes');
    var formatted_runtime = runtime.hours() + 'h ' + runtime.minutes() + 'm';

    // update values

    $('.selected-movie__header .img')
      .removeClass('is-visible');

    $(this.el).find('.selected-movie__header .title').text(this.model.get('title'));
    $(this.el).find('.starring .fieldset__value').text(cast)
    $(this.el).find('.synopsis .fieldset__value').text(this.model.get('synopsis'));
    $(this.el).find('.release-date .fieldset__value').text(formatted_date);
    $(this.el).find('.runtime .fieldset__value').text(formatted_runtime);

    // update background image
    $(this.el).find('.selected-movie__header .img img').attr('src', banner_url).load(function(){
      $('.selected-movie__header .img')
        .css('backgroundImage', 'url("' + banner_url + '")' )
        .addClass('is-visible')
    });;
  }
});