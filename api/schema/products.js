const Joi = require('joi').extend(require('@joi/date'))

exports.create = Joi.object().keys({
    name: Joi.string().required().max(100).regex(/^[a-zA-Z0-9., \-\&]*$/).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
    tags: Joi.string().max(100).regex(/^[a-zA-Z0-9, \-\&]*$/).allow(null).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
    stock: Joi.number().min(0).required(),
    product_category_id: Joi.number().min(1).required(),
    price: Joi.number().min(0).required(),
    discount: Joi.number().min(0).required(),
    create_date: Joi.date().format('YYYY-MM-DD HH:mm:ss').utc(),
    create_user_id: Joi.number().min(1).allow(null)
})

exports.update = Joi.object().keys({
    name: Joi.string().max(100).regex(/^[a-zA-Z0-9., \-\&]*$/).allow(null).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
    tags: Joi.string().max(100).regex(/^[a-zA-Z0-9, \-\&]*$/).allow(null).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
    stock: Joi.number().min(0).allow(null),
    product_category_id: Joi.number().min(1).allow(null),
    price: Joi.number().min(0).allow(null),
    discount: Joi.number().min(0).allow(null),
    update_date: Joi.date().format('YYYY-MM-DD HH:mm:ss').utc(),
    update_user_id: Joi.number().min(1).allow(null),
    is_active: Joi.number().integer().valid(1, 0).allow(null).error(errors => {
        errors.forEach(err => {
            // err.message = err.code
            if (err.code === 'any.only') {
                err.message = `"${err.local.key}" must be one of [1, 0]`
            }
        })

        return errors
    })
})

exports.detail = Joi.object().keys({
    id: Joi.number().min(1).required()
})