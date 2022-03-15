const Joi = require('joi').extend(require('@joi/date'))

exports.create = Joi.object().keys({
    user_level_id: Joi.number().min(1).required(),
    module_id: Joi.number().min(1).required(),
    module_activity_id: Joi.string().max(100).regex(/^[0-9,]*$/).allow(null).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    })
})

exports.update = Joi.object().keys({
    user_level_id: Joi.number().min(1).allow(null),
    module_id: Joi.number().min(1).allow(null),
    module_activity_id: Joi.string().max(100).regex(/^[0-9,]*$/).allow(null).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
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