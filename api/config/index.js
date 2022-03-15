const dotenv = require('dotenv')
const env = process.env.NODE_ENV

switch (env) {
	case 'production':
		dotenv.config({ path: './.env-prod' })
		break;
	default:
		dotenv.config({ path: './.env' })
		break;
}

const { db, dbConn } = require('./database')
const { redisOption, redisExpire, redisService, redisStatus, redisClient } = require('./redis')

const config = {
	env: env,
	timezone: 'Asia/Jakarta',
	port: process.env.PORT || 8000,
	db,
	dbConn,
	redis: {
		option: redisOption,
		expire: redisExpire,
		service: redisService,
		status: redisStatus,
		client: redisClient
	},
	jwt: {
		key: process.env.JWT_KEY || 'the_key',
		key_refresh: process.env.JWT_KEY_REFRESH || 'the_key',
		algorithm: process.env.JWT_ALGORITHM || 'HS256',
		live: process.env.JWT_LIVE || 0, // token will apply after this value (in seconds)
		expire: process.env.JWT_EXPIRE || '1h', // token will expire after this value (in seconds or a string describing a time span zeit/ms)
		expire_refresh: process.env.JWT_EXPIRE_REFRESH || '1d', // refresh token will expire after this value (in seconds or a string describing a time span zeit/ms)
	},
	logDir: process.env.LOG_DIR,
	publicDir: process.env.PUBLIC_DIR || './public/', 
	defaultUserPassword: process.env.USER_PASWD_DEFAULT
}

module.exports = config