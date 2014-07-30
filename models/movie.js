var mongoose = require('mongoose');

var schema = mongoose.Schema({
  ids: {
    rt: {type: Number, default: null},
    imdb: {type: String, default: null},
    tmdb: {type: Number, default: null}
  },
  title: {type: String, default: null},
  original_title: {type: String, default: null},
  mpaa_rating: {type: String, default: null},
  runtime: {type: Number, default: null},
  release_date: {type: String, default: null},
  synopsis: {type: String, default: null},
  ratings: {
    critics_rating: {type: String, default: null},
    critics_score: {type: Number, default: null},
    audience_rating: {type: String, default: null},
    audience_score: {type: Number, default: null},
  },
  poster_url: {type: String, default: null},
  banner_url: {type: String, default: null},
  cast: Array,
  genres: Array,
  videos: Array,
  reviews: Array,
  links: {
    reviews: {type: String, default: null},
    videos: {type: String, default: null},
    credits: {type: String, default: null},
  },
  created_at: Number,
  updated_at: Number
});

module.exports = mongoose.model('Movie', schema);