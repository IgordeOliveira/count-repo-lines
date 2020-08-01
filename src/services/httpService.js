const { setup, RedisStore } = require('axios-cache-adapter')
const AxiosLogger = require('axios-logger')
const redis = require('redis')
// setup redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
})
const store = new RedisStore(client)

// Create `axios` instance with cache adapter
const httpService = setup({
  // `axios` options
  baseURL: 'https://github.com',
  // `axios-cache-adapter` options
  cache: {
    // Tell adapter to attempt using response headers
    readHeaders: true,
    // 30 min of cache if dont find headers
    maxAge: 30 * 60 * 1000,
    // add redis as store for cache
    store
  },
})
httpService.interceptors.request.use(AxiosLogger.requestLogger);

module.exports = { client: httpService }
