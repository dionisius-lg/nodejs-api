const express = require('express')
const router = express.Router()
const moment = require('moment-timezone')
const slug = require('slug')
const _ = require('lodash')
const { timezone } = require('./../config')
const { userLevelsController } = require('./../controller')
const { responseHelper } = require('./../helper')
const { validationMiddleware } = require('./../middleware')
const { userLevelsSchema } = require('./../schema')

moment.tz.setDefault(timezone)
const currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

router.get('/', async (req, res, next) => {
	const conditions = req.query
	const result = await userLevelsController.getAll(conditions)

	return responseHelper.sendSuccessData(res, result)
})

router.get('/:id', validationMiddleware(userLevelsSchema.detail, 'params'), async (req, res, next) => {
	const result = await userLevelsController.getDetail({
        id: req.params.id
    })

	if (result.total_data > 0) {
		return responseHelper.sendSuccessData(res, result)
	}

	return responseHelper.sendDataNotFound(res, result)
})

router.post('/', validationMiddleware(userLevelsSchema.create, 'body'), async (req, res, next) => {
    let data = req.body

    if (data.hasOwnProperty('create_date') === false) {
        data['create_date'] = currentDateTime
    }

    if (data.hasOwnProperty('create_user_id') === false) {
        data['create_user_id'] = req['decoded'].id
    }

    data['is_active'] = '1'

    if (data.hasOwnProperty('name')) {
        let check = await userLevelsController.getDetail({
            name: data['name'],
            is_active: '1'
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }
    }

	const result = await userLevelsController.insertData(data)

	if (result.total_data > 0) {
		return responseHelper.sendCreated(res, result)
	}

	return responseHelper.sendBadRequest(res)
})

router.put('/:id', validationMiddleware(userLevelsSchema.update, 'body'), async (req, res, next) => {
	const paramId = req.params.id
    let data = req.body

    if (data.hasOwnProperty('update_date') === false) {
        data['update_date'] = currentDateTime
    }

    if (data.hasOwnProperty('update_user_id') === false) {
        data['update_user_id'] = req['decoded'].id
    }

    if (data.hasOwnProperty('name')) {
        let check = await userLevelsController.getDetail({
            name: data['name'],
            is_active: '1',
            not_id: paramId
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }
    }

	const result = await userLevelsController.updateData(data, {
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
