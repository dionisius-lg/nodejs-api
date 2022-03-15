const redis = require('redis')

const redisOption = {
    host                 : process.env.REDIS_HOST || '127.0.0.1',
    port                 : process.env.REDIS_PORT || 6379,
    user                 : process.env.REDIS_USER || null,
	password             : process.env.REDIS_PASSWORD || null,
    db                   : process.env.REDIS_DB || null,
	enable_offline_queue : false
}

const redisExpire = process.env.REDIS_DATA_DURATION || 3600 // in seconds
const redisService = process.env.REDIS_SERVICE

let redisStatus = true
let redisClient = false

if (redisService == 1) {
    redisClient = redis.createClient(redisOption)

    // redis error event
    redisClient.on('error', function (err) {
        console.error(`Redis error: ${err}`)
        redisStatus = false
    })

    // redis connect event
    redisClient.on('connect', function () {
        console.log('Redis connected!');
        redisStatus = true
    })

    redisClient.on('reconnecting', function () {
        console.log('Redis reconnecting ...');
        redisStatus = false
    })
}

module.exports = {
    redisOption,
    redisExpire,
    redisService,
    redisStatus,
    redisClient
}