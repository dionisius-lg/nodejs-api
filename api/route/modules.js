const express = require('express')
const router = express.Router()
const moment = require('moment-timezone')
const slug = require('slug')
const _ = require('lodash')
const { timezone } = require('./../config')
const { modulesController } = require('./../controller')
const { responseHelper } = require('./../helper')
const { validationMiddleware } = require('./../middleware')
const { modulesSchema } = require('./../schema')

moment.tz.setDefault(timezone)
const currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

router.get('/', async (req, res, next) => {
	const conditions = req.query
	const result = await modulesController.getAll(conditions)

	return responseHelper.sendSuccessData(res, result)
})

router.get('/:id', validationMiddleware(modulesSchema.detail, 'params'), async (req, res, next) => {
    const result = await modulesController.getDetail({
        id: req.params.id
    })

	if (result.total_data > 0) {
		return responseHelper.sendSuccessData(res, result)
	}

	return responseHelper.sendDataNotFound(res, result)
})

router.post('/', validationMiddleware(modulesSchema.create, 'body'), async (req, res, next) => {
    let data = req.body

    if (data.hasOwnProperty('create_date') === false) {
        data['create_date'] = currentDateTime
    }

    if (data.hasOwnProperty('create_user_id') === false) {
        data['create_user_id'] = req['decoded'].id
    }

    data['is_active'] = '1'

	if (data.hasOwnProperty('name')) {
        let check = await productCategoriesController.getDetail({
            name: data['name'],
            is_active: '1'
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }
    }

	return responseHelper.sendBadRequest(res)
})

router.put('/:id', validationMiddleware(modulesSchema.update, 'body'), async (req, res, next) => {
    const paramId = req.params.id
	let data = req.body

    if (data.hasOwnProperty('update_date') === false) {
        data['update_date'] = currentDateTime
    }

    if (data.hasOwnProperty('update_user_id') === false) {
        data['update_user_id'] = req['decoded'].id
    }

    if (data.hasOwnProperty('name')) {
        let check = await productCategoriesController.getDetail({
            name: data['name'],
            is_active: '1',
            not_id: paramId
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }
    }

	const result = await modulesController.updateData(data, {
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
