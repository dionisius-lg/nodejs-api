const _ = require('lodash')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta')

/**
 * OK 200
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
exports.sendSuccessData = function (res, data) {
	let result = {
		request_time: moment().unix(),
		response_code: 200,
		success: true,
		total_data: data.total_data || 0,
		data: data.data || {},
	}
	
	if (data.limit > 0 && data.total_data > 0) {
		const page_current = _.toInteger(data.page)
		const page_next = page_current + 1
		const page_previous = page_current - 1
		const page_first = 1
		const page_last = _.ceil(data.total_data/data.limit)

		result.paging = {
			current: page_current,
			next: (page_next <= page_last) ? page_next : page_current,
			previous: (page_previous > 0) ? page_previous : 1,
			first: page_first,
			last: (page_last > 0) ? page_last : 1
		}
	}

	return res.status(200).send(result)
}

/**
 * Error 404 Data Not Found
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
exports.sendDataNotFound = function (res, data) {
	let result = {
		request_time: moment().unix(),
		response_code: 404,
		success: false,
		message: 'Data Not Found'
	}

	return res.status(404).send(result)
}

/**
 * Error 404 Data Not Found
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
 exports.sendMsgNotFound = function (res, msg) {
	let result = {
		request_time: moment().unix(),
		response_code: 404,
		success: false,
		message: msg
	}

	return res.status(404).send(result)
}

/**
 * Created 201
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
exports.sendCreated = function (res, data) {
	let result = {
		request_time: moment().unix(),
		response_code: 201,
		success: true,
		total_data: data.total_data || 0,
		data: data.data || {},
	}

	return res.status(201).send(result)
}

/**
 * Error 400
 * @param {Object} res
 * @param {string} message
 * @returns {Object} JSON object
 */
exports.sendBadRequest = function (res, message = '') {
	let customMessage = (message) ? ` ${message}` : ''

	return res.status(400).send({
		request_time: moment().unix(),
		response_code: 400,
		success: false,
		message: `Bad Request.${customMessage}`,
	})
}

/**
 * Error 401
 * @param {Object} res
 * @param {string} message
 * @returns {Object} JSON object
 */
exports.sendUnauthorized = function (res, message = '') {
	let customMessage = (message) ? ` ${message}` : ''

	return res.status(401).send({
		request_time: moment().unix(),
		response_code: 401,
		success: false,
		message: `Unauthorized.${message}`,
	})
}

/**
 * Error 403
 * @param {Object} res
 * @returns {Object} JSON object
 */
exports.sendForbidden = function (res) {
	return res.status(403).send({
		request_time: moment().unix(),
		response_code: 403,
		success: false,
		message: 'You do not have rights to access this resource.',
	})
}

/**
 * Error 404 Resource Not Found
 * @param {Object} res
 * @returns {Object} JSON object
 */
exports.sendNotFound = function (res) {
	return res.status(404).send({
		request_time: moment().unix(),
		response_code: 404,
		success: false,
		message: 'Resource not found.',
	})
}

/**
 * Error 405
 * @param {Object} res
 * @param {string} message
 * @returns {Object} JSON object
 */
exports.sendMethodNotAllowed = function (res, message = '') {
	let customMessage = (message) ? ' ' + message : ''
	return res.status(405).send({
		request_time: moment().unix(),
		response_code: 405,
		success: false,
		message: `Method Not Allowed.${customMessage}`,
	})
}

/**
 * Error 500
 * @param {Object} res
 * @returns {Object} JSON object
 */
exports.sendInternalServerError = (res) => {
	return res.status(500).send({
		request_time: moment().unix(),
		response_code: 500,
		success: false,
		message: 'Internal Server Error.',
	})
}
