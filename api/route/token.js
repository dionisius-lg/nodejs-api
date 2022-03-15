const express = require('express')
const router = express.Router()
const moment = require('moment-timezone')
const slug = require('slug')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const config = require('./../config')
const { tokenController, usersController, userActivitiesController } = require('./../controller')
const { responseHelper } = require('./../helper')
const { validationMiddleware } = require('./../middleware')
const { tokenSchema } = require('./../schema')
const jwt = require('jsonwebtoken')
const { key, key_refresh, algorithm, live, expire, expire_refresh } = require('./../config/index').jwt

moment.tz.setDefault(config.timezone)
const currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

router.post('/', validationMiddleware(tokenSchema.create, 'body'), async (req, res, next) => {
	const { username, password } = req.body

	let user = await usersController.getDetail({
		username: username
	})

	if (user.total_data === 0) {
		user = await usersController.getDetail({
			email: username
		})
		if (user.total_data === 0) {
			return responseHelper.sendDataNotFound(res, user)
		}
	}

	// check password
	if (!bcrypt.compareSync(password, user.data['password'])) {
		return responseHelper.sendDataNotFound(res, user)
	}

	// Generate an access token
	const createToken = await tokenController.createToken({
		id: user.data['id'] || 0,
		password_expired: user.data['expiry_date'] <= currentDateTime.split(' ')[0] || false,
		ip_address: req.socket.remoteAddress,
		user_agent: req.headers['user-agent']
	})

	await usersController.updateData({
		is_online: 1,
		host_address: req.socket.remoteAddress
	}, {
		id: user.data.id
	})

	await userActivitiesController.insertData({
		activity: `Login from ${req.socket.remoteAddress}`,
		activity_date: currentDateTime,
		user_id: user.data.id
	})

	return responseHelper.sendSuccessData(res, createToken)
})

router.get('/refresh', async (req, res, next) => {
	const param = req.decoded

	if (param.user_agent != req.headers['user-agent']) {
        return responseHelper.sendUnauthorized(res)
    }

	if (param.ip_address != req.socket.remoteAddress) {
        return responseHelper.sendUnauthorized(res)
    }

	const user = await usersController.getDetail({
		id: param.id
	})

	if (user.total_data === 0) {
		return responseHelper.sendDataNotFound(res, user)
	}

	// Generate an access token
	const createToken = await tokenController.createToken({
		id: user.data['id'] || 0,
		password_expired: user.data['expiry_date'] <= currentDateTime.split(' ')[0] || false,
		ip_address: param.ip_address,
		user_agent: param.user_agent
	})

	await usersController.updateData({
		is_online: 1,
		host_address: req.socket.remoteAddress
	}, {
		id: user.data.id
	})

	await userActivitiesController.insertData({
		activity: `Login from ${req.socket.remoteAddress}`,
		activity_date: currentDateTime,
		user_id: user.data.id
	})

	return responseHelper.sendSuccessData(res, createToken)
})

// router.post('/refresh', validationMiddleware(tokenSchema.refresh, 'body'), async (req, res, next) => {
//     // read id and username from request token

//     const dataParam = {
//         id: req.decoded.id,
//         username: req.decoded.username
//     }
	
//     const ip_address = req.decoded.ip_address
//     const userAgent = req.decoded.user_agent
    
//     if (userAgent != req.headers['user-agent']) {
//         return responseHelper.sendUnauthorized(res)
//     }

//     // filter user from given data
//     const user = await usersController.getDetail(dataParam)

//     if (user.data === false) {
//         return responseHelper.sendDataNotFound(res, user)
//     }

//     const data = {
//         id: user.data.id || 0,
//         username: dataParam.username || false,
//         ip_address: req.connection.remoteAddress,
//         user_agent: req.headers['user-agent']
//     }    
//     // Generate an access token
//     const createToken = await tokenController.createToken(data)
    
//     return responseHelper.sendSuccessData(res, createToken)
// })

// router.post('/', validationMiddleware(tokenSchema.remove, 'body'), async (req, res, next) => {
router.post('/', async (req, res, next) => {
	// get userId from decoded token
	const userId = req.decoded.id || 0

	await usersController.updateData({
        is_login: '0'
    }, {
        id: userId
    })

	await userActivitiesController.insertData({
		activity: `Logout from ${req.socket.remoteAddress}`,
		activity_date: currentDateTime,
		user_id: userId
	})

	return responseHelper.sendSuccessData(res, {})
})

// for existing endpoint with other request method
router.all(['/'], (req, res, next) => {
	responseHelper.sendMethodNotAllowed(res)
})

module.exports = router