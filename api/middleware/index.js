const authMiddleware = require('./auth')
const fileValidationMiddleware = require('./file_validation')
const recordValidationMiddleware = require('./record_validation')
const requestMiddleware = require('./request')
const responseMiddleware = require('./response')
const validationMiddleware = require('./validation')

module.exports = {
    authMiddleware,
    fileValidationMiddleware,
    recordValidationMiddleware,
    requestMiddleware,
    responseMiddleware,
    validationMiddleware
}