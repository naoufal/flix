module.exports = {

  NODE_ENV: 'development',

  PORT: 5000,   // port to run the API server on

  REDIS_URL: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
  MONGO_URL: process.env.MONGOHQ_URL || 'mongodb://localhost/flix',

  THEMOVIEDB_KEY: 'OVERWRITE WITH LOCAL FILE',
  ROTTENTOMATOES_KEY: 'OVERWRITE WITH LOCAL FILE'
};
