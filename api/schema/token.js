const Joi = require('joi')
const date = Joi.date()

exports.create = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

exports.refresh = Joi.object({
    refresh_token: Joi.string().required()
})

exports.remove = Joi.object({
    refresh_token: Joi.string().required()
})