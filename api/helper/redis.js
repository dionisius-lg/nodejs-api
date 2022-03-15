const crypto = require('crypto')
const { redis } = require('./../config')

/**
 * set data for Redis
 * @param  {string} key - Redis key
 * @param  {string} field - Redis field
 * @param  {Object} data - Redis data
 * @param  {number} expire - expire value (in seconds)
 * @returns {Promise.<string>} - reply result
 */
exports.setData = ({ key = '', field = '', data = {}, expire = '' }) => {
    return new Promise(async (resolve, reject) => {
        if (!redis.status) {
            return resolve(false)
        }

        let dataField = crypto.createHash('md5').update(field).digest('hex')
        redis.client.hmset(key, dataField, JSON.stringify(data), async (err, res) => {
            let setExpire = await this.setExpire({ key, expire })
            resolve(res)
        })
    })
}

/**
 * get data from Redis
 * @param  {string} key - Redis key
 * @param  {string} field - Redis field
 * @returns {Promise.<Object>} - data result
 */
exports.getData = ({ key = '', field = '' }) => {
    return new Promise(async (resolve, reject) => {
        if (!redis.status) {
            return resolve(false)
        }

        let dataField = crypto.createHash('md5').update(field).digest('hex')
        let checkData = await this.checkData({ key, field })

        if (checkData == 1) {
            redis.client.hmget(key, dataField, (err, res) => {
                if (err) {
                    console.error(err)
                    return resolve(err)
                }

                resolve(JSON.parse(res))
            })
        } else {
            resolve(false)
        }
    })
}

/**
 * check Redis key and field
 * @param  {string} key - Redis key
 * @param  {string} field - Redis field
 * @returns {Promise.<number>} - reply result
 */
exports.checkData = ({ key = '', field = '' }) => {
    return new Promise((resolve, reject) => {
        if (!redis.status) {
            return resolve(false)
        }

        let dataField = crypto.createHash('md5').update(field).digest('hex')
        redis.client.hexists(key, dataField, (err, res) => {
            if (err) {
                console.error(err)
                return resolve(err)
            }

            resolve(res)
        })
    })
}

/**
 * delete field and data from Redis key
 * @param  {string[]} key - Redis key
 * @returns {Promise.<number>} - reply result
 */
exports.deleteData = ({ key = [] }) => {
    return new Promise((resolve, reject) => {
        if (!redis.status) {
            return resolve(false)
        }

        for (k in key) {
            redis.client.del(key[k], (err, res) => {
                if (err) {
                    console.error(err)
                }
            })
        }
    })
}

/**
 * set expire data for Redis
 * @param  {string} key - Redis key
 * @param  {number} expire - expire value (in seconds)
 * @returns {Promise.<number>} - reply result
 */
exports.setExpire = ({ key = '', expire = '' }) => {
    return new Promise((resolve, reject) => {
        if (!redis.status) {
            return resolve(false)
        }

        const exp = expire || redis.expire
        redis.redis.expire(key, exp, (err, res) => {
            if (err) {
                console.error(res)
            }
        })
    })
}
