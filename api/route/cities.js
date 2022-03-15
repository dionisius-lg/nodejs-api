const express = require('express')
const router = express.Router()
const moment = require('moment-timezone')
const slug = require('slug')
const _ = require('lodash')
const { timezone } = require('./../config')
const { citiesController } = require('./../controller')
const { responseHelper } = require('./../helper')
const { validationMiddleware } = require('./../middleware')
const { citiesSchema } = require('./../schema')

moment.tz.setDefault(timezone)
const currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

router.get('/', async (req, res, next) => {
	const conditions = req.query
	const result = await citiesController.getAll(conditions)

	return responseHelper.sendSuccessData(res, result)
})

router.get('/:id', validationMiddleware(citiesSchema.detail, 'params'), async (req, res, next) => {
	const result = await citiesController.getDetail({
        id: req.params.id
    })

	if (result.total_data > 0) {
		return responseHelper.sendSuccessData(res, result)
	}

	return responseHelper.sendDataNotFound(res, result)
})

router.post('/', validationMiddleware(citiesSchema.create, 'body'), async (req, res, next) => {
    let data = req.body

    data['is_active'] = '1'

    if (data.hasOwnProperty('name')) {
        let check = await citiesController.getDetail({
            name: data['name'],
            is_active: '1'
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }
    }

	const result = await citiesController.insertData(data)

	if (result.total_data > 0) {
		return responseHelper.sendCreated(res, result)
	}

	return responseHelper.sendBadRequest(res)
})

router.put('/:id', validationMiddleware(citiesSchema.update, 'body'), async (req, res, next) => {
	const paramId = req.params.id
    let data = req.body

    if (data.hasOwnProperty('name')) {
        let check = await citiesController.getDetail({
            name: data['name'],
            is_active: '1',
            not_id: paramId
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }
    }

	const result = await citiesController.updateData(data, {
        id: paramId
    })

	if (result.total_data > 0) {
		return responseHelper.sendSuccessData(res, result)
	}

	return responseHelper.sendBadRequest(res)
})

// for existing endpoint with other request method
router.all(['/'], (req, res, next) => {
	responseHelper.sendMethodNotAllowed(res)
})

module.exports = router
