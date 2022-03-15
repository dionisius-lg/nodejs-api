// const jwt = require('jsonwebtoken')
const _ = require('lodash')
const config = require('./../config')
const { dbQueryHelper, redisHelper, responseHelper } = require('./../helper')
const { key, key_refresh, algorithm, live, expire, expire_refresh } = require('../config/index').jwt

const jwt = require('jsonwebtoken')

/**
 * Verify JWT token
 * @param  {Object} req - Express request object
 * @param  {Object} res - Express response object
 * @param  {Object} next - Express next method
 */
exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
        const token = authHeader.split(' ')[1]
        const options = {
            algorithms: [algorithm]
        }

        jwt.verify(token, key, options, (err, decoded) => {
            if (err) {
                return responseHelper.sendUnauthorized(res)
            }

            req.decoded = decoded
            next()
        })
    } else {
        return responseHelper.sendForbidden(res)
    }
}

/**
 * Verify JWT refresh token
 * @param  {Object} req - Express request object
 * @param  {Object} res - Express response object
 * @param  {Object} next - Express next method
 */
 exports.authenticateJWTRefresh = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
        const token = authHeader.split(' ')[1]
        const options = {
            algorithms: [algorithm]
        }

        jwt.verify(token, key_refresh, options, async (err, decoded) => {
            if (err) {
                return responseHelper.sendUnauthorized(res)
            }

            req.decoded = decoded
            const userId = decoded.id
            const userAgent = _.replace(decoded.user_agent, ' ', '')

            // get refresh token list
            if (redisHelper.serviceStatus == 1) { // using redis
                const getCache = await redisHelper.getData({ key: `RefreshToken:${userId}:${userAgent}`, field: 'token' })

                if (getCache != token) {
                    return responseHelper.sendUnauthorized(res)
                }
            } else { // using database
                const table = 'refresh_tokens'
                const conditions = { user_id: userId, user_agent: userAgent, is_active: 1 }
                const result = await dbQueryHelper.getDetail({ table, conditions })

                if (result.data === false || result.data.token != token) {
                    return responseHelper.sendUnauthorized(res)
                }
            }

            next()
        })
    } else {
        return responseHelper.sendForbidden(res)
    }
}

