const jwt = require('jsonwebtoken')
const moment = require('moment-timezone')
const ms = require('ms')
const _ = require('lodash')
const { redisHelper, dbQueryHelper } = require('./../helper')
const { key, key_refresh, algorithm, live, expire, expire_refresh } = require('./../config/index').jwt
const { redis, timezone } = require('./../config')

moment.tz.setDefault(timezone)

/**
 * Create Token
 * @param {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
const createToken = (data = { 'id': '', 'ip_address': '', 'user_agent': '' }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }

        let now = new Date()
        const expireMilSeconds = ms(expire)
        const expireSeconds = Math.floor(expireMilSeconds / 1000)
        // add jwt expire
        const addExpireSeconds = now.getSeconds() + _.toInteger(expireSeconds)
        now.setSeconds(addExpireSeconds)
        const timestamp = now.getTime()
        const expireDate = moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
        const refresh = await refreshToken(data)
        const options = {
            expiresIn: expire,
            algorithm: algorithm
        }

        jwt.sign(data, key, options, (err, token) => {
            if (err) {
                return resolve(res)
            }

            data.token = token
            data.token_expires_in = expireDate
            data.refresh_token = refresh.token
            data.refresh_token_expires_in = refresh.expireDate

            let {
                ip_address,
                user_agent,
                ...rest
            } = data;

            res = {
                total_data: 1,
                limit: 0,
                page: 1,
                data: rest
            }

            resolve(res)
        })
    })
}

/**
 * Refresh Token
 * @param {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
const refreshToken = (data = { 'id': '', 'ip_address': '', 'user_agent': '' }) => {
    return new Promise((resolve, reject) => {
        let now = new Date()
        const expireMilSeconds = ms(expire_refresh)
        const expireSeconds = Math.floor(expireMilSeconds / 1000)
        // add jwt expire
        const addExpireSeconds = now.getSeconds() + _.toInteger(expireSeconds)
        now.setSeconds(addExpireSeconds)
        const timestamp = now.getTime()
        const expireDate = moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
        const options = {
            expiresIn: expire_refresh,
            algorithm: algorithm
        }

        jwt.sign(data, key_refresh, options, async (err, token) => {
            if (err) {
                return resolve(res)
            }

            let res = {
                token,
                expireDate
            }
            const userId = data.id
            const userAgent = _.replace(data.user_agent, ' ', '')

            // register refresh token
            if (redisHelper.serviceStatus == 1) { // using redis
                redisHelper.setData({ key: `RefreshToken:${userId}:${userAgent}`, field: 'token', data: token, expire: expireSeconds })
            } else { // using database
                const dataToken = [
                    {
                        user_id: userId,
                        user_agent: userAgent,
                        token: token,
                        is_active: 1,
                        expired: expireDate
                    }
                ]
                const result = await dbQueryHelper.insertDuplicateUpdateData({ table: 'refresh_tokens', data: dataToken })

                if (result.data === false) {
                    res = {
                        token: '',
                        expireDate: ''
                    }
                }
            }

            return resolve(res)
        })
    })
}


const removeRefreshToken = (data = { 'id': '', 'ip_address': '', 'user_agent': '' }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let now = new Date()
        let expireMilSeconds = ms(expire)
        let expireSeconds = Math.floor(expireMilSeconds / 1000)
        // add jwt expire
        let addExpireSeconds = now.getSeconds() + _.toInteger(expireSeconds)
        now.setSeconds(addExpireSeconds)
        let timestamp = now.getTime()
        let expireDate = dateFormat(timestamp, 'yyyy-mm-dd HH:MM:ss')
        const options = {
            expiresIn: expire, 
            algorithm: algorithm
        }
        // remove token in redis / for db, set column is_active = 0 in table refresh_tokens
        
        jwt.sign(data, key, options, (err, token) => {
            if (err) {
                return resolve(res)
            }

            data.token = token
            data.token_expires_in = expireDate

            delete data.id
            delete data.ip_address
            delete data.user_agent

            res = {
                total_data: 1,
                limit: 0,
                page: 1,
                data: data
            }
            resolve(res)
        })
    })
}

module.exports = {
    createToken,
    refreshToken,
    removeRefreshToken
}