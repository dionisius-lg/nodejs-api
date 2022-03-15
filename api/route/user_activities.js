const express = require('express')
const router = express.Router()
const moment = require('moment-timezone')
const slug = require('slug')
const _ = require('lodash')
const { timezone } = require('./../config')
const { userActivitiesController } = require('./../controller')
const { responseHelper } = require('./../helper')
const { validationMiddleware } = require('./../middleware')
const { userActivitiesSchema } = require('./../schema')

moment.tz.setDefault(timezone)
const currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

router.get('/', async (req, res, next) => {
	const conditions = req.query
	const result = await userActivitiesController.getAll(conditions)

	return responseHelper.sendSuccessData(res, result)
})

router.get('/:id', validationMiddleware(userActivitiesSchema.detail, 'params'), async (req, res, next) => {
	const result = await userActivitiesController.getDetail({
        id: req.params.id
    })

	if (result.total_data > 0) {
		return responseHelper.sendSuccessData(res, result)
	}

	return responseHelper.sendDataNotFound(res, result)
})

router.post('/', validationMiddleware(userActivitiesSchema.create, 'body'), async (req, res, next) => {
    let data = req.body

    if (data.hasOwnProperty('activity_date') === false) {
        data['activity_date'] = currentDateTime
    }

	const result = await userActivitiesController.insertData(data)

	if (result.total_data > 0) {
		return responseHelper.sendCreated(res, result)
	}

	return responseHelper.sendBadRequest(res)
})

// for existing endpoint with other request method
router.all(['/'], (req, res, next) => {
	responseHelper.sendMethodNotAllowed(res)
})

module.exports = router
