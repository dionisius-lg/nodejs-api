const Joi = require('joi').extend(require('@joi/date'))

exports.create = Joi.object().keys({
    name: Joi.string().required().max(100).regex(/^[a-zA-Z0-9. ]*$/).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
    province_id: Joi.number().min(1).required()
})

exports.update = Joi.object().keys({
    name: Joi.string().max(100).regex(/^[a-zA-Z0-9. ]*$/).allow(null).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
    province_id: Joi.number().min(1).allow(null),
    is_active: Joi.number().integer().valid(1, 0).allow(null).error(errors => {
        errors.forEach(err => {
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