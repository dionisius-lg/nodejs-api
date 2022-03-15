const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const config = require('./../config')
const { responseHelper } = require('./../helper')
const { authMiddleware } = require('./../middleware')

const scriptName = path.basename(__filename)

const routePath = './api/route/'

const publicPath = [
    '/token',
    '/token/refresh',
    '/users/login',
    '/users/forgot_password',
    '/users/password_verification',
    '/users/email_verification',
    '/emails/forgot_password',
    /^\/users\/verification_code\/([^\/]*)$/,
    /^\/users\/password_verification\/([^\/]*)$/
]

const refreshTokenPath = [
    '/token/refresh'
]

const matchInArray = (string, expressions) => {
    const len = expressions.length

    for (let i=0; i<len; i++) {
        if (string.match(expressions[i])) {
            return true
        }
    }

    return false
}

const unlessPath = (path = [], authMiddleware) => {
    return (req, res, next) => {
        const insideRegex = matchInArray(req.path, path)

        if (_.indexOf(path, req.path) >= 0 || insideRegex) {
            return next()
        } else {
            return authMiddleware(req, res, next)
        }
    }

}

const unlessPathRefresh = (path = [], authMiddleware) => {
    return (req, res, next) => {
        if (_.indexOf(path, req.path) >= 0) {
            return authMiddleware(req, res, next)
        } else {
            return next()
        }
    }
}

router.get('/', (req, res) => {
    res.send({app: 'NodeJs Api'})
})

// enable auth middleware except for some routes
router.use(unlessPathRefresh(refreshTokenPath, authMiddleware.authenticateJWTRefresh))
router.use(unlessPath(publicPath, authMiddleware.authenticateJWT))

fs.readdirSync(routePath).forEach((file) => {
    // not including this file
    if (file != scriptName) {
        // get only filename, cut the file format (.js)
        const name = file.split('.')[0]
        router.use(`/${name}`, require(`./${name}`))
    }
})

// for non-existing route
router.all('*', (req, res) => {
    responseHelper.sendNotFound(res)
})

// for production
if (config.env == 'production') {
    // override error
    router.use((error, req, res, next) => {
        if (error instanceof SyntaxError) { // Handle SyntaxError here.
            return responseHelper.sendBadRequest(res, 'Data Not Valid')
        }

        console.error(error.stack)
        responseHelper.sendInternalServerError(res)
    })
}

module.exports = router