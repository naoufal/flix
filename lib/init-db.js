var nconf = require('nconf');
var mongoose = require('mongoose');
var debug = require('debug')('init');

// connect to db
mongoose.connect(nconf.get('MONGO_URL'), function(){
  debug('database connection established');
});