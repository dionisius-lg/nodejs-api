const express = require('express')
const router = express.Router()
const moment = require('moment-timezone')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const { timezone, defaultUserPassword } = require('./../config')
const { usersController } = require('./../controller')
const { responseHelper } = require('./../helper')
const { validationMiddleware } = require('./../middleware')
const { usersSchema } = require('./../schema')

moment.tz.setDefault(timezone)
const currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

router.get('/', async (req, res, next) => {
	const conditions = req.query
	const result = await usersController.getAll(conditions)

	return responseHelper.sendSuccessData(res, result)
})

router.get('/:id', validationMiddleware(usersSchema.detail, 'params'), async (req, res, next) => {
	const conditions = { id: req.params.id }
	const result = await usersController.getDetail(conditions)

	if (result.data === false) {
		return responseHelper.sendDataNotFound(res, result)
	}

	if ('password' in result.data) {
		delete result.data['password']
	}

	return responseHelper.sendSuccessData(res, result)
})

router.get('/online', async (req, res, next) => {
	const conditions = req.query
	const result = await usersController.getOnlineUser(conditions)

	return responseHelper.sendSuccessData(res, result)

})

router.post('/', validationMiddleware(usersSchema.create, 'body'), async (req, res, next) => {
	const hashPassword = bcrypt.hashSync(`${defaultUserPassword}`, 10)

	let body = {
		username: req.body.username,
		password: hashPassword,
		user_level_id: req.body.user_level_id,
		department_id: req.body.department_id,
		fullname: req.body.fullname,
		firstname: req.body.firstname,
		middlename: req.body.middlename,
		lastname: req.body.lastname,
		nickname: req.body.nickname,
		salutation: req.body.salutation,
		email: req.body.email,
		mobile: req.body.mobile,
		phone: req.body.phone,
		address: req.body.address,
		pbx_inbound: req.body.pbx_inbound,
		ext_inbound: req.body.ext_inbound,
		ext_inbound_pwd: req.body.ext_inbound_pwd,
		pbx_outbound: req.body.pbx_outbound,
		ext_outbound: req.body.ext_outbound,
		ext_outbound_pwd: req.body.ext_outbound_pwd,
		expiry_date: currentDateTime,
		birth_date: req.body.birth_date,
		join_date: req.body.join_date,
		is_active: req.body.is_active,
		created_at: 'NOW()',
		created_by: req.decoded.id || 0
	}
	const result = await usersController.insertData(body)

	if (result.data === false) {
		return responseHelper.sendBadRequest(res, 'Invalid Data')
	}

	return responseHelper.sendCreated(res, result)
})

router.put('/:id', validationMiddleware(usersSchema.update, 'body'), async (req, res, next) => {
	const conditions = { id: req.params.id }
	const body = req.body

	if (typeof body.password !== "undefined") {
		const hashPassword = bcrypt.hashSync(body.password, 10)
		body.password = hashPassword
		let future = new Date()
		const expireTimestamp = future.setDate(future.getDate() + 30)
		const expire = moment(expireTimestamp).format('YYYY-MM-DD HH:mm:ss')
		body.expiry_date = expire

	}

	if (typeof body.user_activity_id !== "undefined") {
		body.last_activity_time = "NOW()"

	}
	const result = await usersController.updateData(body, conditions)
	if (result.data === false) {
		return responseHelper.sendBadRequest(res, 'Invalid Data')
	}


	return responseHelper.sendSuccessData(res, result)
})

// router.get('/:id/modules', validationMiddleware(userSchema.detail, 'params'), async (req, res, next) => {
// 	const conditions = { id: req.params.id }
// 	const result = await usersController.getAllModule(conditions)

// 	if (result.data === false) {
// 		return response.sendDataNotFound(res, result)
// 	}

// 	return response.sendSuccessData(res, result)
// })

// router.put('/:id/password', validationMiddleware(userSchema.detail, 'params'), validationMiddleware(userSchema.changePassword, 'body'), async (req, res, next) => {
// 	const saltRounds = 10
// 	const hashPassword = bcrypt.hashSync(req.body.new_password, saltRounds)
// 	const conditions = {
// 		id: req.params.id
// 	}
// 	const body = {
// 		password: hashPassword,
// 		password_exp_date: req.body.password_exp_date
// 	}

// 	// get user data
// 	const user = await usersController.getDetail(conditions)

// 	if (user.data === false) {
// 		return response.sendDataNotFound(res, user)
// 	}

// 	if (!bcrypt.compareSync(req.body.old_password, user.data.password)) {
// 		return response.sendDataNotFound(res, user)
// 	}

// 	const result = await usersController.updatePassword(body, conditions)

// 	if (result.data === false) {
// 		return response.sendBadRequest(res, 'Invalid Data')
// 	}

// 	return response.sendSuccessData(res, result)
// })

// router.post('/email_verification', validationMiddleware(userSchema.detailEmail, 'body'), async (req, res, next) => {
// 	const conditions = { email: req.body.email }
// 	const result = await usersController.getDetail(conditions)

// 	if (result.data === false) {
// 		return response.sendDataNotFound(res, result)
// 	}

// 	return response.sendSuccessData(res, result)
// })

// router.post('/forgot_password', validationMiddleware(userSchema.forgotPassword, 'body'), async (req, res, next) => {
// 	const conditions = {
// 		email: req.body.email,
// 		is_active: 1,
// 		is_password_request: 0
// 	}
// 	const body = {
// 		is_password_request: 1,
// 		verification_code: req.body.verification_code
// 	}
// 	const result = await usersController.updatePassword(body, conditions)

// 	if (result.data === false) {
// 		return response.sendBadRequest(res, 'Invalid Data')
// 	}

// 	return response.sendSuccessData(res, result)
// })

// router.put('/password_verification/:code', validationMiddleware(userSchema.verificationCode, 'params'), validationMiddleware(userSchema.forgotPasswordChange, 'body'), async (req, res, next) => {
// 	const conditions = {
// 		//email: req.body.email,
// 		verification_code: req.params.code, //req.body.verification_code,
// 		is_password_request: 1
// 	}
// 	let body = {
// 		is_password_request: 0,
// 		password_expiration_date: req.body.password_expiration_date || null
// 	}
// 	const saltRounds = 10
// 	body.password = bcrypt.hashSync(req.body.password, saltRounds)
// 	const result = await usersController.updatePassword(body, conditions)

// 	if (result.data === false) {
// 		return response.sendBadRequest(res, 'Invalid Data')
// 	}

// 	return response.sendSuccessData(res, result)
// })

// router.get('/verification_code/:code', validationMiddleware(userSchema.verificationCode, 'params'), async (req, res, next) => {
// 	const conditions = {
// 		verification_code: req.params.code,
// 		is_password_request: 1
// 	}
// 	const result = await usersController.getDetail(conditions)

// 	if (result.data === false) {
// 		return response.sendDataNotFound(res, result)
// 	}

// 	return response.sendSuccessData(res, result)
// })

// router.put('/:id/photo', validationMiddleware(userSchema.detail, 'params'), fileMiddleware.singleFile({ fieldName: 'photo', fileSizeLimit: 1, fileType: 'userPhoto', fileFilter: 'image' }), async (req, res, next) => {
// 	const conditions = { id: req.params.id }
// 	const result = await usersController.uploadPhoto(req.body, conditions)

// 	if (result.data === false) {
// 		return response.sendBadRequest(res, 'Invalid Data')
// 	}

// 	return response.sendSuccessData(res, result)
// })

// for existing endpoint with other request method
router.all(['/', '/login', '/:id', '/:id/password', '/:id/photo', '/forgot_password', '/password_verification'], (req, res, next) => {
	responseHelper.sendMethodNotAllowed(res)
})

module.exports = router
