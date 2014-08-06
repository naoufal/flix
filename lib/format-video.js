var URL = {
  youtube: 'http://www.youtube.com/watch?v=',
  vimeo: 'http://vimeo.com'
}

/*
 * Expects a tmdb video object
 * Returns a object with url and type
 */
module.exports.index = function(video, cb){
  var site = video.site.toLowerCase();
  var url = URL[site];

  return {
    url: url + video.key,
    type: video.type
  };
};