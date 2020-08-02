const { setup, RedisStore } = require('axios-cache-adapter')
const AxiosLogger = require('axios-logger')
const { ConcurrencyManager } = require('axios-concurrency');
const AxiosRetry = require('axios-retry');
const redis = require('redis')

// setup redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
})
const store = new RedisStore(redisClient)

// Create `axios` instance with cache adapter
const client = setup({
  // `axios` options
  baseURL: 'https://github.com',
  // `axios-cache-adapter` options
  cache: {
    // Tell adapter to attempt using response headers
    readHeaders: true,
    // 30 min of cache if dont find maxAge headers
    maxAge: 30 * 60 * 1000,
    // add redis as store for cache
    store
  },
})

client.interceptors.request.use(AxiosLogger.requestLogger);

// SETUP of axios concurrency to avoid 429 too many request errors
const MAX_CONCURRENT_REQUESTS = 50;
ConcurrencyManager(client, MAX_CONCURRENT_REQUESTS);

// SETUP retry for failed request
AxiosRetry(client, {
  retries: 4,
  retryDelay: AxiosRetry.exponentialDelay
});

module.exports = { client }
