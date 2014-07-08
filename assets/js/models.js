var $        = require('jquery');
var Backbone = require('backbone');
var _        = require('lodash');

var API_URL = 'http://127.0.0.1:5000';

module.exports.Movie = Backbone.Model.extend({
  initialize: function(){
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