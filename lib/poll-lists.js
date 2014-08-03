var nconf   = require('nconf');
var async   = require('async');
var cronJob = require('cron').CronJob;
var VError  = require('verror');
var request = require('superagent');
var debug   = require('debug')('poll')

var externalFetch = require('./external-fetch');
var ENV = nconf.get('NODE_ENV');

var update_lists = new cronJob({
  // every hour
  cronTime: '0 0 * * * *',
  onTick: function() {
    pollEachCategory(nconf.get('LISTS'), function(err){
      if (err) debug(err);
    });
  },
  start: false
});

update_lists.start();

var ping_server = new cronJob({
  // every 30 minutes
  cronTime: '0 0,30 * * * *',
  onTick: function() {
    request
      .get('/api/user/online')
      .end(function(err, response){
        console.log('pinged server')
      });
  },
  start: false
});


var pollEachCategory = function(lists, cb){
  async.eachSeries(lists, function(list, next_list){
    externalFetch.movieList(list.slug, function(err, movie_list){
      if (err) return next_list(new VError(err, 'Failed to poll ' + list.slug))

      // self-imposed rate limit
      setTimeout(function(){
        debug(list.slug + ' poll complete');
        next_list();
      }, 1000);
    });
  }, function afterEach(err){
    if (err) return cb(err);
    debug('polling complete');
  });
}

// if on production, poll on app startup and
// ping server every 30 mins to keep heroku from going idle
if (ENV != 'development') {
  ping_server.start();

  pollEachCategory(nconf.get('LISTS'), function(err){
    if (err) debug(err);
  });
}