var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');

var API_URL = 'http://127.0.0.1:5000';

module.exports.Movies = Backbone.Collection.extend({
  model: Model.Movie,
  url: function(){
    var category;

    // fallback if no category is provided
    if (!this.options.category) {
      this.options.category = 'in-theatres';
    }

    category = this.options.category;
    return API_URL + '/api/category/' + category;
  },
  parse: function(response, xhr){
    // add response to localStorage
    var cache_key = this.options.category.replace('-', '_');

    localStorage.setItem(cache_key, JSON.stringify(response));

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