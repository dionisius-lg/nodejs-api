const Joi = require('joi').extend(require('@joi/date'))

exports.create = Joi.object().keys({
    activity: Joi.string().required().max(100).regex(/^[a-zA-Z0-9., \-\&]*$/).error(errs => {
        errs.forEach(err => {
            if (err.code === 'string.pattern.base') {
                err.message = `"${err.local.key}" format is invalid.`
            }
        })

        return errs
    }),
    activity_date: Joi.date().format('YYYY-MM-DD HH:mm:ss').utc(),
    user_id: Joi.number().min(1).required()
})

exports.detail = Joi.object().keys({
    id: Joi.number().min(1).required()
})