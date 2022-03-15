const response = require('../helper/response')

exports.emails = async (req, res, next) => {
    const emailsController = require('../controller/emails')
    const conditions = {id: req.params.id}
	const data = await emailsController.getDetail(conditions)

	if (data.data === false) {
		return response.sendFailedData(res, data)
    }
    
    next()
}

exports.tickets = async (req, res, next) => {
    const ticketsController = require('../controller/tickets')
    const conditions = {id: req.params.id}
	const data = await ticketsController.getDetail(conditions)

	if (data.data === false) {
		return response.sendFailedData(res, data)
    }
    
    next()
}

exports.users = async (req, res, next) => {
    const usersController = require('../controller/users')
    const conditions = {id: req.params.id}
	const data = await usersController.getDetail(conditions)

	if (data.data === false) {
		return response.sendFailedData(res, data)
    }
    
    next()
}
