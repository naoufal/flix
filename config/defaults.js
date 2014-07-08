module.exports = {

  NODE_ENV: 'development',

  PORT: 5000,   // port to run the API server on

  REDIS_URL: {
    host: 'redis://127.0.0.1',
    port: '6379'
  },
  THEMOVIEDB_KEY: 'OVERWRITE WITH LOCAL FILE',
  ROTTENTOMATOES_KEY: 'OVERWRITE WITH LOCAL FILE'
};
