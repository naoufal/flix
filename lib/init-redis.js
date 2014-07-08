var nconf = require('nconf');
var redis = require("redis");

module.exports = function(){

  var client = redis.createClient( nconf.get('REDIS:port'), nconf.get('REDIS:host') );

  if (nconf.get('REDIS:password')){
    client.auth( nconf.get('REDIS:password'), function(err){
      if (err) console.log( err );
      else {
        console.log('       Redis connection authenticated');
      }
    });
  }

  client.on('error', function (err) {
    console.log('REDIS Error: ' + err);
  });

  return client;

}();