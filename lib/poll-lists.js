var nconf   = require('nconf');
var async   = require('async');
var cronJob = require('cron').CronJob;
var VError  = require('verror');
var externalFetch = require('./external-fetch');
var debug   = require('debug')('poll')

var ENV = nconf.get('NODE_ENV');

var job = new cronJob({
  cronTime: '00 00,00 * * * *',
  onTick: function() {
    pollEachCategory(nconf.get('LISTS'), function(err){
      if (err) debug(err);
    });
  },
  start: false
});

job.start();



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

// if on production, poll on app startup
if (ENV == 'production') {
  pollEachCategory(nconf.get('LISTS'), function(err){
    if (err) debug(err);
  });
}