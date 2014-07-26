var nconf = require('nconf');
var redis = require('redis');
var debug = require('debug')('init');

module.exports = function(){

  var client = redis.createClient( nconf.get('REDIS:port'), nconf.get('REDIS:hostname') );

  if (nconf.get('REDIS:auth')){
    var redis_password = nconf.get('REDIS:auth').split(':').pop();

    client.auth(redis_password, function(err){
      if (err) console.log( err );
      else {
        debug('redis connection authenticated');
      }
    });
  }

  client.on('error', function (err) {
    debug('redis error: ' + err);
  });

  return client;

}();