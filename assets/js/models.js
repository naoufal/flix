var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');

var API_URL = 'http://127.0.0.1:5000';

module.exports.Movie = Backbone.Model.extend({
  initialize: function(){
  }
});

module.exports.DetailedMovie = Backbone.Model.extend({
  urlRoot: '/api/movie',
  initialize: function(){
    this.fetch({reset: true});
  },
  parse: function(response) {
    return response.movie;
  }
});

module.exports.Category = Backbone.Model.extend({
  defaults: {
    name: null,
    selected: false
  },
  initialize: function(){
  }
});