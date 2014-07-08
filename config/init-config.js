/*
  Sets up config. All stored and accessible via nconf
*/

var nconf = require('nconf');
var fs = require('fs');
var _ = require('lodash');

nconf
  .use('memory') // store config in memory
  .argv() // command-line arguments
  .env() // environment variables
  .defaults( require('./defaults') ); // default values

// add uncommitted keys
if (fs.existsSync( __dirname + '/local.js')){
  var local_config = require('./local');
  _.each(local_config, function(val, key){
    nconf.set(key, val);
  })
}

console.log('       Initializing config');