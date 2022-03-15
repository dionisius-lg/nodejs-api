const moment = require('moment-timezone')
const _ = require('lodash')
const redisHelper = require('./redis')
const requestHelper = require('./request')
const config = require('./../config')
const dbConn = config.dbConn
const redis = config.redis

moment.tz.setDefault(config.timezone)

/**
 * Return table columns
 * @param  {string} [db = config.db.name] - Database's name
 * @param  {string} table - Table's name
 * @returns {Promise.<string[]>} Array of selected table's column name
 */
exports.checkColumn = ({ db = config.db.name, table = '' }) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${db}' AND TABLE_NAME = '${table}'`
        dbConn.query(query, (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return
            }

            const columns = results.map((i) => {
                return i.COLUMN_NAME
            })

            resolve(columns)
        })
    })
}

/**
 * Return total data
 * @param  {string} table - Table's name
 * @param  {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @param  {Object.<string, string[]>} [conditionTypes={ 'like': [], 'date': [], 'time': [] }] - Condition option for certain table field. 'like' field will be treated with 'LIKE' condition. 'date' field will be treated iwht 'DATE()' function inside query condition
 * @param  {string[]} customConditions - custom query condition. @example ['tableA.columnTableA = "someValue"']
 * @param  {Object.<string>} join - JOIN query statement. @example ['JOIN tableB ON tableB.id = tableA.table_b_id']
 * @param  {Object.<string>} groupBy - GROUP BY query statement. @example ['columnA']
 * @param  {Object.<string>} having - HAVING query statement. groupBy param required. @example ['COUNT(columA) > 1']
 * @returns {Promise.<number|Object.<string, number|boolean>>} total data of given table and condition
 */
exports.countData = ({ table = '', conditions = {}, conditionTypes = { 'like': [], 'date': [], 'time': [] }, customConditions = [], join = [], groupBy = [], having = [] }) => {
    return new Promise((resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let setCond = []
        let queryCond = ''
        let query = `SELECT COUNT(*) AS count FROM ${table}`

        if (!_.isEmpty(join) && _.isArrayLikeObject(join)) {
            let joinQuery = _.join(join, ' ')
            query += ` ${joinQuery}`
        }

        if (!_.isEmpty(conditions) && _.isObjectLike(conditions)) {
            Object.keys(conditions).forEach((key) => {
                if (!_.isEmpty(conditionTypes)) {
                    if (_.indexOf(conditionTypes.like, key) >= 0) {
                        let val = `%${conditions[key]}%`
                        setCond.push(`${table}.${key} LIKE ${dbConn.escape(val)}`)
                    } else if (_.indexOf(conditionTypes.date, key) >= 0) {
                        let val = (_.toNumber(conditions[key]) > 0) ? moment(conditions[key] * 1000) : moment(new Date())
                        setCond.push(`DATE(${table}.${key}) = ${dbConn.escape(val.format('YYYY-MM-DD'))}`)
                    } else if (_.indexOf(conditionTypes.time, key) >= 0) {
                        let val = (_.toNumber(conditions[key]) > 0) ? moment(conditions[key] * 1000) : moment(new Date())
                        setCond.push(`TIME(${table}.${key}) = ${dbConn.escape(val.format('HH:mm:ss'))}`)
                    } else {
                        setCond.push(`${table}.${key} = ${dbConn.escape(conditions[key])}`)
                    }
                } else {
                    setCond.push(`${table}.${key} = ${dbConn.escape(conditions[key])}`)
                }
            })

            queryCond = _.join(setCond, ' AND ')
            query += ` WHERE ${queryCond}`
        }

        if (!_.isEmpty(customConditions) && _.isArrayLikeObject(customConditions)) {
            queryCond = ' WHERE ' + _.join(customConditions, ' AND ')

            if (!_.isEmpty(conditions)) {
                queryCond = ' AND ' + _.join(customConditions, ' AND ')
            }

            query += `${queryCond}`
        }

        if (!_.isEmpty(groupBy) && _.isArrayLikeObject(groupBy)) {
            groupBy = groupBy.map((item) => {
                if (item.indexOf('.') >= 0) {
                    return item
                } else {
                    return `${table}.${item}`
                }
            })

            const columnGroup = _.join(groupBy, ', ')
            query += ` GROUP BY ${columnGroup}`

            if (!_.isEmpty(having) && _.isArrayLikeObject(having)) {
                const havingClause = _.join(having, ' AND ')
                query += ` HAVING ${havingClause}`
            }

            const queryCount = `SELECT COUNT(*) AS count FROM (${query}) AS count_${table}`
            query = queryCount
        }

        dbConn.query(query, (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            const data = results[0].count

            resolve(data)
        })
    })
}

/**
 * SELECT query
 * @param  {string} table - Table's name
 * @param  {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @param  {Object.<string, string[]>} [conditionTypes={ 'like': [], 'date': [], 'time': [] }]  - Condition option for certain table field. 'like' field will be treated with 'LIKE' condition. 'date' field will be treated iwht 'DATE()' function inside query condition
 * @param  {string[]} customConditions - custom query condition. @example ['tableA.columnTableA = "someValue"']
 * @param  {Object.<string>} columnSelect - custom column to select. @example {'columnA', 'columnB'}
 * @param  {Object.<string>} columnDeselect - custom column to deselect. @example {'columnA', 'columnB'}
 * @param  {string[]} customColumns - custom column from join table. @example ['tableB.columnTableB AS newUniqueColumn']
 * @param  {Object.<string>} join - JOIN query statement. @example ['JOIN tableB ON tableB.id = tableA.table_b_id']
 * @param  {Object.<string>} groupBy - GROUP BY query statement. @example ['columnA']
 * @param  {Object.<string>} having - HAVING query statement. groupBy param required. @example ['COUNT(columA) > 1']
 * @param  {string} cacheKey - set key for Redis. if empty, table name will be used as the key
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
exports.getAll = ({ table = '', conditions = {}, conditionTypes = { 'like': [], 'date': [], 'time': [] }, customConditions = [], columnSelect = [], columnDeselect = [], customColumns = [], join = [], groupBy = [], having = [], cacheKey = '' }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let columns = await this.checkColumn({ table })
        const masterColumns = columns
        let column = ''
        const sortData = ['ASC', 'DESC']
        let order = (!_.isEmpty(conditions.order)) ? conditions.order : columns[0]
        order = (_.indexOf(columns, order) >= 0) ? order : columns[0]
        const sort = (_.indexOf(sortData, _.toUpper(conditions.sort)) >= 0) ? _.toUpper(conditions.sort) : 'ASC'
        const limit = (conditions.limit > 0) ? conditions.limit : 20
        let page = (conditions.page > 0) ? conditions.page : 1
        let setCond = []
        let queryCond = ''

        if (!_.isEmpty(columnSelect) && _.isArrayLikeObject(columnSelect)) {
            // filter data from all table columns, only keep selected columns
            let validColumn = _.intersection(columnSelect, columns)
            columns = validColumn
        }

        if (!_.isEmpty(columnDeselect) && _.isArrayLikeObject(columnDeselect)) {
            // filter data, get column to exclude from valid selected columns or table columns
            let deselectedColumn = _.intersection(columnDeselect, columns)
            // filter data, exclude deselected columns
            let selectedColumn = _.difference(columns, deselectedColumn)
            columns = selectedColumn
        }

        if (!_.isEmpty(join) && _.isArrayLikeObject(join)) {
            // give prefix table to table columns
            let prefixColumn = columns.map(function (col) {
                return `${table}.${col}`
            })

            columns = prefixColumn
        }

        column = _.join(columns, ', ')

        if (!_.isEmpty(customColumns) && _.isArrayLikeObject(customColumns)) {
            column += ', ' + _.join(customColumns, ', ')
        }

        let query = `SELECT ${column} FROM ${table}`

        if (!_.isEmpty(join) && _.isArrayLikeObject(join)) {
            let joinQuery = _.join(join, ' ')
            query += ` ${joinQuery}`
        }

        // remove invalid column from conditions
        requestHelper.filterColumn(conditions, masterColumns)

        if (!_.isEmpty(conditions) && _.isObjectLike(conditions)) {
            Object.keys(conditions).forEach((key) => {
                if (!_.isEmpty(conditionTypes)) {
                    if (_.indexOf(conditionTypes.like, key) >= 0) {
                        let val = `%${conditions[key]}%`
                        setCond.push(`${table}.${key} LIKE ${dbConn.escape(val)}`)
                    } else if (_.indexOf(conditionTypes.date, key) >= 0) {
                        let val = (_.toNumber(conditions[key]) > 0) ? moment(conditions[key] * 1000) : moment(new Date())
                        setCond.push(`DATE(${table}.${key}) = ${dbConn.escape(val.format('YYYY-MM-DD'))}`)
                    } else if (_.indexOf(conditionTypes.time, key) >= 0) {
                        let val = (_.toNumber(conditions[key]) > 0) ? moment(conditions[key] * 1000) : moment(new Date())
                        setCond.push(`TIME(${table}.${key}) = ${dbConn.escape(val.format('HH:mm:ss'))}`)
                    } else {
                        setCond.push(`${table}.${key} = ${dbConn.escape(conditions[key])}`)
                    }
                } else {
                    setCond.push(`${table}.${key} = ${dbConn.escape(conditions[key])}`)
                }
            })

            queryCond = _.join(setCond, ' AND ')
            query += ` WHERE ${queryCond}`
        }

        if (!_.isEmpty(customConditions) && _.isObjectLike(customConditions)) {
            queryCond = ' WHERE ' + _.join(customConditions, ' AND ')

            if (!_.isEmpty(conditions)) {
                queryCond = ' AND ' + _.join(customConditions, ' AND ')
            }

            query += `${queryCond}`
        }

        if (!_.isEmpty(groupBy) && _.isArrayLikeObject(groupBy)) {
            groupBy = groupBy.map((item) => {
                if (item.indexOf('.') >= 0) {
                    return item
                } else {
                    return `${table}.${item}`
                }
            })

            const columnGroup = _.join(groupBy, ', ')
            query += ` GROUP BY ${columnGroup}`

            if (!_.isEmpty(having) && _.isArrayLikeObject(having)) {
                const havingClause = _.join(having, ' AND ')
                query += ` HAVING ${havingClause}`
            }
        }

        if (order !== undefined || !_.isEmpty(order)) {
            let orderColumn = order

            if (orderColumn.indexOf('.') === -1) {
                orderColumn = `${table}.${order}`
            }

            query += ` ORDER BY ${orderColumn} ${sort}`
        }

        if (limit > 0) {
            const offset = (limit * page) - limit

            if (_.isInteger(offset) && offset >= 0) {
                query += ` LIMIT ${limit} OFFSET ${offset}`
            } else {
                query += ` LIMIT ${limit}`
            }
        }

        let countData = await this.countData({ table, conditions, conditionTypes, customConditions, join, groupBy, having })

        if (redis.service == 1) {
            const key = cacheKey || table
            const getCache = await redisHelper.getData({ key: key, field: query })

            if (getCache) {
                // get data from cache
                return resolve(getCache)
            }
        }
        console.log('SQL-GETALL: ', query);
        dbConn.query(query, (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            const data = {
                total_data: countData,
                limit: limit,
                page: page,
                data: results
            }

            if (redis.service == 1) {
                redisHelper.setData({ key: table, field: query, data })
            }

            resolve(data)
        })
    })
}

/**
 * SELECT query for detail specific condition
 * @param  {string} table - Table's name
 * @param  {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @param  {Object.<string>} columnSelect - custom column to select. @example {'columnA', 'columnB'}
 * @param  {Object.<string>} columnDeselect - custom column to deselect. @example {'columnA', 'columnB'}
 * @param  {string[]} customColumns - custom column from join table. @example ['tableB.columnTableB AS newUniqueColumn']
 * @param  {Object.<string>} join - JOIN query statement. @example ['JOIN tableB ON tableB.id = tableA.table_b_id']
 * @param  {Object.<string>} groupBy - GROUP BY query statement. @example ['columnA']
 * @param  {Object.<string>} having - HAVING query statement. groupBy param required. @example ['COUNT(columA) > 1']
 * @param  {string} cacheKey - set key for Redis. if empty, table name will be used as the key
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
exports.getDetail = ({ table = '', conditions = {}, customConditions = [], columnSelect = [], columnDeselect = [], customColumns = [], join = [], groupBy = [], cacheKey = '' }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let columns = await this.checkColumn({ table })
        let column = ''
        let setCond = []
        let queryCond = ''

        if (!_.isEmpty(columnSelect) && _.isArrayLikeObject(columnSelect)) {
            // filter data from all table columns, only keep selected columns
            let validColumn = _.intersection(columnSelect, columns)
            columns = validColumn
        }

        if (!_.isEmpty(columnDeselect) && _.isArrayLikeObject(columnDeselect)) {
            // filter data, get column to exclude from valid selected columns or table columns
            let deselectedColumn = _.intersection(columnDeselect, columns)
            // filter data, exclude deselected columns
            let selectedColumn = _.difference(columns, deselectedColumn)
            columns = selectedColumn
        }

        if (!_.isEmpty(join) && _.isArrayLikeObject(join)) {
            let prefixColumn = columns.map(function (col) {
                return `${table}.${col}`
            })

            columns = prefixColumn
        }

        column = _.join(columns, ', ')

        if (!_.isEmpty(customColumns) && _.isArrayLikeObject(customColumns)) {
            let append = ''

            if (column) {
                append = ', '
            }

            column += append + _.join(customColumns, ', ')
        }

        let query = `SELECT ${column}`

        if (table) {
            query += ` FROM ${table}`
        } 

        if (!_.isEmpty(join) && _.isArrayLikeObject(join)) {
            let joinQuery = _.join(join, ' ')
            query += ` ${joinQuery}`
        }

        if (!_.isEmpty(conditions)) {
            Object.keys(conditions).forEach((key) => {
                if (key.indexOf('.') >= 0) {
                    setCond.push(`${key} = ${dbConn.escape(conditions[key])}`)
                } else {
                    setCond.push(`${table}.${key} = ${dbConn.escape(conditions[key])}`)
                }
            })

            queryCond = _.join(setCond, ' AND ')
            query += ` WHERE ${queryCond}`
        }

        if (!_.isEmpty(customConditions) && _.isObjectLike(customConditions)) {
            queryCond = ' WHERE ' + _.join(customConditions, ' AND ')

            if (!_.isEmpty(conditions)) {
                queryCond = ' AND ' + _.join(customConditions, ' AND ')
            }

            query += `${queryCond}`
        }

        if (!_.isEmpty(groupBy) && _.isArrayLikeObject(groupBy)) {
            groupBy = groupBy.map((item) => {
                if (item.indexOf('.') >= 0) {
                    return item
                } else {
                    return `${table}.${item}`
                }
            })

            const columnGroup = _.join(groupBy, ', ')
            query += ` GROUP BY ${columnGroup}`
        }

        if (table) {
            query += ` LIMIT 1`
        }

        if (redis.service == 1 && table != '') {
            const key = cacheKey || table
            const getCache = await redisHelper.getData({ key: key, field: query })

            if (getCache) {
                // get data from cache
                return resolve(getCache)
            }
        }
        console.log('SQL-GETDETAIL: ', query);
        dbConn.query(query, (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            if (!_.isEmpty(results)) {
                res = {
                    total_data: 1,
                    limit: 0,
                    page: 1,
                    data: results[0]
                }

                if (redis.service == 1 && table != '') {
                    redisHelper.setData({ key: table, field: query, data: res })
                }
            }

            resolve(res)
        })
    })
}

/**
 * INSERT query
 * @param  {string} table - Table's name
 * @param  {Object.<string, string|number>} data - Data to insert. @example {columnName: 'newValue'}
 * @param  {string[]} protectedColumns - Columns to be ignore for insert statement. @example ['columnA', 'columnB']
 * @param  {string[]} cacheKeys - Redis key to be remove. @example {'keyTableA', 'keyTableB'}
 * @returns {Promise.<Object.<string, number|boolean|Object>>} - data result
 */
exports.insertData = ({ table = '', data = {}, protectedColumns = [], cacheKeys = [] }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let timeChar = ['CURRENT_TIMESTAMP()', 'NOW()']
        let nullChar = ['NULL']
        const columns = await this.checkColumn({ table })
        // remove invalid column from data
        requestHelper.filterColumn(data, columns)
        // remove invalid data
        requestHelper.filterData(data)

        if (_.isEmpty(data)) {
            // reject('Insert query require some data')
            return resolve(res)
        }

        let keys = Object.keys(data)
        // check protected columns on submitted data
        let forbiddenColumns = _.intersection(protectedColumns, keys)

        if (!_.isEmpty(forbiddenColumns)) {
            return resolve(res)
        }

        let column = _.join(keys, ', ')
        let query = `INSERT INTO ${table} (${column}) VALUES ?`
        let values = []
        let tempVal = Object.keys(data).map(k => {
            let dataVal = ''

            if (typeof data[k] !== undefined) {
                dataVal = _.trim(data[k])

                if (_.indexOf(timeChar, _.toUpper(dataVal)) >= 0) {
                    dataVal = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                }

                if (_.indexOf(nullChar, _.toUpper(dataVal)) >= 0) {
                    dataVal = null
                }
            } else {
                dataVal = null
            }

            return dataVal
        })

        values.push(tempVal)
        
        dbConn.query(query, [values], (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            if (redis.service == 1) {
                if (_.isArray(cacheKeys) && !_.isEmpty(cacheKeys)) {
                    cacheKeys.push(table)
                    redisHelper.deleteData({ key: cacheKeys })
                } else {
                    redisHelper.deleteData({ key: [table] })
                }
            }

            res = {
                total_data: results.affectedRows,
                data: { id: results.insertId }
            }

            resolve(res)
        })
    })
}

/**
 * Multiple INSERT query.
 * @param  {string} table - Table's name
 * @param  {Array.<Object>} data - Data to insert. @example [{columnName: 'newValueA'}, {columnName: 'newValueB'}]
 * @param  {string[]} protectedColumns - Columns to be ignore for insert statement. @example ['columnA', 'columnB']
 * @param  {string[]} cacheKeys - Redis key to be remove. @example {'keyTableA', 'keyTableB'}
 * @returns {Promise.<Object.<string, number|boolean|Object>>} - data result
 */
exports.insertManyData = ({ table = '', data = {}, protectedColumns = [], cacheKeys = [] }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let timeChar = ['CURRENT_TIMESTAMP()', 'NOW()']
        let nullChar = ['NULL']

        // if data invalid object
        if (!_.isObjectLike(data) || _.isEmpty(data) || data.length === undefined) {
            return resolve(res)
        }

        // get table columns
        const columns = await this.checkColumn({ table })
        // compare fields from data with columns
        const diff = _.difference(data[0], columns)

        // if there are invalid fields/columns
        if (!_.isEmpty(diff)) {
            return resolve(res)
        }

        // remove invalid data
        requestHelper.filterData(data[0])
        const keys = Object.keys(data[0])

        // if key data empty
        if (_.isEmpty(keys)) {
            return resolve(res)
        }

        // check protected columns on submitted data
        const forbiddenColumns = _.intersection(protectedColumns, keys)

        if (!_.isEmpty(forbiddenColumns)) {
            return resolve(res)
        }

        const column = keys.join(', ')
        let query = `INSERT INTO ${table} (${column}) VALUES ?`
        let values = []
        let tempVal = []

        for (key in data) {
            // if 'key' and 'data order' on each object not the same
            if (!_.isEqual(keys, Object.keys(data[key]))) {
                return resolve(res)
            }

            tempVal = Object.keys(data[key]).map(k => {
                let dataVal = ''

                if (typeof data[key][k] !== undefined) {
                    dataVal = _.trim(data[key][k])

                    if (_.indexOf(timeChar, _.toUpper(dataVal)) >= 0) {
                        dataVal = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                    }

                    if (_.indexOf(nullChar, _.toUpper(dataVal)) >= 0) {
                        dataVal = null
                    }
                } else {
                    dataVal = null
                }

                return dataVal
            })

            values.push(tempVal)
        }

        dbConn.query(query, [values], (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            if (redis.service == 1) {
                if (_.isArray(cacheKeys) && !_.isEmpty(cacheKeys)) {
                    cacheKeys.push(table)
                    redisHelper.deleteData({ key: cacheKeys })
                } else {
                    redisHelper.deleteData({ key: [table] })
                }
            }

            res = {
                total_data: results.affectedRows,
                data: data
            }

            resolve(res)
        })
    })
}

/**
 * Multiple INSERT query with ON DUPLICATE KEY UPDATE condition
 * @param  {string} table - Table's name
 * @param  {Array.<Object>} data - Data to insert. @example [{columnName: 'newValueA'}, {columnName: 'newValueB'}]
 * @param  {string[]} protectedColumns - Columns to be ignore for insert statement. @example ['columnA', 'columnB']
 * @param  {string[]} cacheKeys - Redis key to be remove. @example {'keyTableA', 'keyTableB'}
 * @returns {Promise.<Object.<string, number|boolean|Object>>} - data result
 */
exports.insertDuplicateUpdateData = ({ table = '', data = {}, protectedColumns = [], cacheKeys = [] }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let timeChar = ['CURRENT_TIMESTAMP()', 'NOW()']
        let nullChar = ['NULL']

        // if data invalid object
        if (!_.isObjectLike(data) || _.isEmpty(data) || data.length === undefined) {
            return resolve(res)
        }

        // get table columns
        const columns = await this.checkColumn({ table })
        // compare fields from data with columns
        const diff = _.difference(data[0], columns)

        // if there are invalid fields/columns
        if (!_.isEmpty(diff)) {
            return resolve(res)
        }

        // remove invalid data
        requestHelper.filterData(data[0])
        const keys = Object.keys(data[0])

        // if key data empty
        if (_.isEmpty(keys)) {
            return resolve(res)
        }

        // check protected columns on submitted data
        const forbiddenColumns = _.intersection(protectedColumns, keys)

        if (!_.isEmpty(forbiddenColumns)) {
            return resolve(res)
        }

        const column = keys.join(', ')
        let update = []

        keys.forEach(function (value) {
            update.push(`${value} = VALUES(${value})`)
        })

        const updateDuplicate = _.join(update, ', ')

        let query = `INSERT INTO ${table} (${column}) VALUES ? ON DUPLICATE KEY UPDATE ${updateDuplicate}`
        let values = []
        let tempVal = []

        for (key in data) {
            // if 'key' and 'data order' on each object not the same
            if (!_.isEqual(keys, Object.keys(data[key]))) {
                return resolve(res)
            }

            tempVal = Object.keys(data[key]).map(k => {
                let dataVal = ''

                if (typeof data[key][k] !== undefined) {
                    dataVal = _.trim(data[key][k])

                    if (_.indexOf(timeChar, _.toUpper(dataVal)) >= 0) {
                        dataVal = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                    }

                    if (_.indexOf(nullChar, _.toUpper(dataVal)) >= 0) {
                        dataVal = null
                    }
                } else {
                    dataVal = null
                }

                return dataVal
            })

            values.push(tempVal)
        }

        dbConn.query(query, [values], (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            if (redis.service == 1) {
                if (_.isArray(cacheKeys) && !_.isEmpty(cacheKeys)) {
                    cacheKeys.push(table)
                    redisHelper.deleteData({ key: cacheKeys })
                } else {
                    redisHelper.deleteData({ key: [table] })
                }
            }

            res = {
                total_data: results.affectedRows,
                data: data
            }

            resolve(res)
        })
    })
}

/**
 * UPDATE query
 * @param  {string} table - Table's name
 * @param  {Object.<string, string|number>} data - Data to insert. @example {columnName: 'newValue'}
 * @param  {Object.<string, string|number>} conditions - Query conditions
 * @param  {string[]} protectedColumns - Columns to be ignore for insert statement. @example ['columnA', 'columnB']
 * @param  {string[]} cacheKeys - Redis key to be remove. @example {'keyTableA', 'keyTableB'}
 * @returns {Promise.<Object.<string, number|boolean|Object>>} - data result
 */
exports.updateData = ({ table = '', data = {}, conditions = {}, protectedColumns = [], cacheKeys = [] }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let timeChar = ['CURRENT_TIMESTAMP()', 'NOW()']
        let nullChar = ['NULL']
        let setData = []
        let queryData = ''
        let setCond = []
        let queryCond = ''
        let query = `UPDATE ${table}`
        const columns = await this.checkColumn({ table })

        // remove invalid column from data
        requestHelper.filterColumn(data, columns)
        // remove invalid data
        requestHelper.filterData(data)

        if (_.isEmpty(data) || _.isEmpty(conditions)) {
            // reject('Update query is unsafe without data and condition')
            return resolve(res)
        }

        if (!_.isEmpty(data)) {
            const keys = Object.keys(data)
            // check protected columns on submitted data
            const forbiddenColumns = _.intersection(protectedColumns, keys)

            if (!_.isEmpty(forbiddenColumns)) {
                return resolve(res)
            }

            for (key in data) {
                let dataVal = _.trim(data[key])

                if (typeof data[key] !== undefined) {
                    if (_.indexOf(timeChar, _.toUpper(dataVal)) >= 0) {
                        dataVal = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                    }

                    if (_.indexOf(nullChar, _.toUpper(dataVal)) >= 0) {
                        dataVal = null
                    }
                } else {
                    dataVal = null
                }

                setData.push(`${key} = ${dbConn.escape(dataVal)}`)
            }

            queryData = _.join(setData, ', ')

            query += ` SET ${queryData}`
        }

        if (!_.isEmpty(conditions)) {
            for (key in conditions) {
                setCond.push(`${key} = ${dbConn.escape(_.trim(conditions[key]))}`)
            }

            queryCond = _.join(setCond, ' AND ')

            query += ` WHERE ${queryCond}`
        }

        dbConn.query(query, (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            if (redis.service == 1) {
                if (_.isArray(cacheKeys) && !_.isEmpty(cacheKeys)) {
                    cacheKeys.push(table)
                    redisHelper.deleteData({ key: cacheKeys })
                } else {
                    redisHelper.deleteData({ key: [table] })
                }
            }

            res = {
                total_data: results.affectedRows,
                data: conditions
            }

            if (res.total_data < 1 || results.warningCount) {
                res.data = false
            }

            resolve(res)
        })
    })
}

/**
 * DELETE query
 * @param  {string} table - Table's name
 * @param  {Object.<string, string|number>} conditions - Query conditions
 * @param  {string[]} cacheKeys - Redis key to be remove. @example {'keyTableA', 'keyTableB'}
 * @returns {Promise.<Object.<string, number|boolean|Object>>} - data result
 */
exports.deleteData = ({ table = '', conditions = {}, cacheKeys = [] }) => {
    return new Promise(async (resolve, reject) => {
        let res = {
            total_data: 0,
            data: false
        }
        let setCond = []
        let queryCond = ''
        let query = `DELETE FROM ${table}`

        if (_.isEmpty(conditions)) {
            // reject('Delete query is unsafe without condition')
            return resolve(res)
        }

        for (key in conditions) {
            setCond.push(`${key} = ${dbConn.escape(conditions[key])}`)
        }

        queryCond = _.join(setCond, ' AND ')

        query += ` WHERE ${queryCond}`

        dbConn.query(query, (err, results, fields) => {
            if (err) {
                // throw err
                console.error(err)
                return resolve(res)
            }

            if (redis.service == 1) {
                if (_.isArray(cacheKeys) && !_.isEmpty(cacheKeys)) {
                    cacheKeys.push(table)
                    redisHelper.deleteData({ key: cacheKeys })
                } else {
                    redisHelper.deleteData({ key: [table] })
                }
            }

            res = {
                total_data: results.affectedRows,
                data: conditions
            }

            if (res.total_data == 0) {
                res.data = false
            }

            resolve(res)
        })
    })
}
