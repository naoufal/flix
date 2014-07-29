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
    self.$el.empty().scrollTop(0);

    var count = 0;
    _.each(this.collection.models, function(movie) {
      var itemView = new View.MovieItem({model: movie});
      itemView.render();
      self.$el.append(itemView.el);
      setTimeout(function(){
        $('li[data-movie-cid="' + itemView.model.cid + '"]').addClass('is-visible');
      }, 60 * count);

      $(itemView.el).find('img').load(function(){
        $(itemView.el).addClass('is-loaded');
      });
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
    var template = require("../templates/movie-list-item.hbs");

    // format data
    var formatted_cast = _.chain(this.model.get('cast'))
      .pluck('name')
      .first(3)
      .value()
      .toString().replace(/,/g, ', ');

    // append data to template
    $(this.el)
      .attr('data-movie-cid', this.model.cid)
      .append(template({
        title: this.model.get('title'),
        poster_url: this.model.get('poster'),
        cast: formatted_cast
      }));

  },
  events: {
    'click': 'showSelectedMovie'
  },
  showSelectedMovie: function(e){
    $('.selected-movie').addClass('is-visible').removeAttr('style');

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
    } else if (!cache_response && !Flix.config.isOnline) {
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

    if (cached_is_expired && Flix.config.isOnline) {
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
    $('.selected-movie').removeClass('is-visible');

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
    $(this.el).empty();
    var template = require("../templates/movie-info.hbs");

    // setup data
    var synopsis = this.model.get('synopsis');
    var runtime = moment.duration(this.model.get('runtime'), 'minutes');
    var formatted_runtime = runtime.hours() + 'h ' + runtime.minutes() + 'm';
    var formatted_date = moment(this.model.get('release_date')).format('MMMM D, YYYY');
    var formatted_cast = _.chain(this.model.get('cast'))
      .pluck('name')
      .first(3)
      .value()
      .toString().replace(/,/g, ', ');

    // append data to template
    $(this.el).append(template({
      title: this.model.get('title'),
      banner_url: this.model.get('banner_url'),
      poster_url: this.model.get('poster_url'),
      cast: formatted_cast,
      synopsis: synopsis,
      release_date: formatted_date,
      runtime: formatted_runtime
    }));

    // hide empty attributes
    if (formatted_cast == '') $('.starring', this.el).remove();
    if (synopsis == '') $('.synopsis', this.el).remove();
    if (formatted_date == 'January 1, 1970') $('.release-date', this.el).remove();

    // fade in background image
    $(this.el).find('.selected-movie__header .img img').load(function(){
      $('.selected-movie__header .img')
        .css('backgroundImage', 'url("' + $(this).attr('src') + '")' )
        .addClass('is-visible')
    });

    // find back button
    $(this.el).find('.btn.left').on('click', function(){
      $('.overlay').removeClass('is-visible');
      $('.selected-movie')
        .removeClass('is-visible')
        .css({
          'transform': 'translate3d(' + UI.windowWidth + 'px, 0, 0)'
        });
    });

    // fix movie content scroll
    UI.initMovieView();
  }
});
