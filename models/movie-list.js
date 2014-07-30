var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name: {type: String, default: null},
  slug: {type: String, default: null},
  movies: Array,
  created_at: Number,
  updated_at: Number
});

module.exports = mongoose.model('MovieList', schema);