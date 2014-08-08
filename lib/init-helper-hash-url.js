/*
  This sets up a view helper on app.locals to replace file paths with their cdn cached urls

  In development, we just use the local files

  In production, we use Fastly
*/

var path = require('path');
var nconf = require('nconf');

var hash_cache = {};
var ENV = nconf.get('NODE_ENV');

hash_cache = require('../assets/hashmap.json');

module.exports.init = function(app){
  app.locals.hashUrl = function(file_url){
    if (ENV == 'development'){
      return file_url;
    }

    var file_name = file_url.substr(1); // remove leading slash, hashmap doesn't have any
    var file_hash = hash_cache[ file_name ];

    if ( !file_hash ) return file_url;

    var ext = path.extname( file_name );

    file_name = path.join( path.dirname( file_name ), file_hash + '.' + path.basename( file_name, ext ) + ext );

    return '/' + file_name;
  };
};

