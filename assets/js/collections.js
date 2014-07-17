var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');

module.exports.Movies = Backbone.Collection.extend({
  model: Model.Movie,
  url: function(){
    var category;

    category = this.options.category;
    return '/api/category/' + category;
  },
  parse: function(response, xhr){
    if (response.error) return UI.showPopup('Something went wrong', response.error);

    // add response to localStorage
    var cache_key = this.options.category.replace('-', '_');

    // only cache if response has movies
    if (response.movies) {
      localStorage.setItem(cache_key, JSON.stringify(response));
    }

    return response.movies;
  },
  initialize: function(models, options){
    // set options on the collection
    if (!(models instanceof Array)) {
      this.options = models;
    } else if (models && options === undefined) {
      this.options = {};
    } else {
      this.options = options;
    }

    // if models aren't passed, fetch from url
    if (!(models instanceof Array)) {
      this.fetch({reset: true});
    }
  }
});


module.exports.Categories = Backbone.Collection.extend({
  model: Model.Category,
  initialize: function(models, options) {
  }
});