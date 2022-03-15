const express = require('express')
const router = express.Router()
const moment = require('moment-timezone')
const slug = require('slug')
const _ = require('lodash')
const { timezone } = require('./../config')
const { productsController } = require('./../controller')
const { responseHelper } = require('./../helper')
const { validationMiddleware } = require('./../middleware')
const { productsSchema } = require('./../schema')

moment.tz.setDefault(timezone)
const currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

router.get('/', async (req, res, next) => {
	const conditions = req.query
	const result = await productsController.getAll(conditions)

	return responseHelper.sendSuccessData(res, result)
})

router.get('/:id', validationMiddleware(productsSchema.detail, 'params'), async (req, res, next) => {
	const result = await productsController.getDetail({
        id: req.params.id
    })

	if (result.total_data > 0) {
		return responseHelper.sendSuccessData(res, result)
	}

	return responseHelper.sendDataNotFound(res, result)
})

router.post('/', validationMiddleware(productsSchema.create, 'body'), async (req, res, next) => {
    let data = req.body

    if (data.hasOwnProperty('create_date') === false) {
        data['create_date'] = currentDateTime
    }

    if (data.hasOwnProperty('create_user_id') === false) {
        data['create_user_id'] = req['decoded'].id
    }

    data['is_active'] = '1'

	if (data.hasOwnProperty('name')) {
        let check = await productsController.getDetail({
            name: data['name'],
            is_active: '1'
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }

        data['slug'] = slug(data['name'])

        check = await productsController.getDetail({
            slug: data['slug'],
            is_active: '1'
        })

        if (check.total_data > 0) {
            data['slug'] += `-${check.total_data + 1}`
        }
    }

	const result = await productsController.insertData(data)

	if (result.total_data > 0) {
		return responseHelper.sendCreated(res, result)
	}

	return responseHelper.sendBadRequest(res)
})

router.put('/:id', validationMiddleware(productsSchema.update, 'body'), async (req, res, next) => {
    const paramId = req.params.id
    let data = req.body

    if (data.hasOwnProperty('update_date') === false) {
        data['update_date'] = currentDateTime
    }

    if (data.hasOwnProperty('update_user_id') === false) {
        data['update_user_id'] = req['decoded'].id
    }

    if (data.hasOwnProperty('name')) {
        let check = await productsController.getDetail({
            name: data['name'],
            is_active: '1',
            not_id: paramId
        })

        if (check.total_data > 0) {
            return responseHelper.sendBadRequest(res, '"name" already exist.')
        }

        data['slug'] = slug(data['name'])

        check = await productsController.getDetail({
            slug: data['slug'],
            is_active: '1',
            not_id: paramId
        })

        if (check.total_data > 0) {
            data['slug'] += `-${check.total_data + 1}`
        }
    }

	const result = await productsController.updateData(data, {
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
