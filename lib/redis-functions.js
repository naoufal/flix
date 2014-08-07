var Step  = require('step');
var debug = require('debug')('cache');
var redis = require('../lib/init-redis');

var set = function(key, value, cb){
  Step(
    function redisSet(){
      var value_string = JSON.stringify(value);
      // set for a year
      redis.setex(key, 60 * 60 * 24 * 365, value_string, this);
    },
    function redisError(err) {
      if (err) console.error(err);
      debug('set (' + key + ') in redis');
      cb(err);
    }
  );
}

module.exports.set = set;
