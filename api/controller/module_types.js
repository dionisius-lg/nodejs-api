const _ = require('lodash')
const { dbQueryHelper } = require('./../helper')
const table = 'module_types'

/**
 * Get All Data
 * @param {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
exports.getAll = async (conditions) => {
    let customConditions = []

    if (conditions.hasOwnProperty('not_id')) {
        if (!_.isEmpty(conditions['not_id']) && !_.isNaN(conditions['not_id'])) {
            customConditions.push(`id != ${conditions['not_id']}`)
        }

        delete conditions['not_id']
    }

    if (conditions.hasOwnProperty('alias_id')) {
        if (!_.isEmpty(conditions['alias_id']) && !_.isNaN(conditions['alias_id'])) {
            customConditions.push(`id = ${conditions['alias_id']}`)
        }

        delete conditions['alias_id']
    }

    const customColumns = []

    const join = []

    const columnSelect = []
    const columnDeselect = [] // will not be provide in return

    const conditionTypes = {
        'like': ['name', 'code'],
        'date': [],
        'time': []
    }

    const groupBy = [
        'id'
    ]

    const data = await dbQueryHelper.getAll({
        table,
        conditions,
        customConditions,
        customColumns,
        join,
        columnSelect,
        columnDeselect,
        conditionTypes,
        groupBy
    })

    return data
}

/**
 * Get Detail Data
 * @param {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
exports.getDetail = async (conditions) => {
    let customConditions = []

    if (conditions.hasOwnProperty('not_id')) {
        if (!_.isEmpty(conditions['not_id']) && !_.isNaN(conditions['not_id'])) {
            customConditions.push(`${table}.id != ${conditions['not_id']}`)
        }

        delete conditions['not_id']
    }

    const customColumns = []

    const join = []

    const columnSelect = []
    const columnDeselect = [] // will not be provide in return

    const groupBy = [
        'id'
    ]

    const data = await dbQueryHelper.getDetail({
        table,
        conditions,
        customConditions,
        customColumns,
        join,
        columnSelect,
        columnDeselect,
        groupBy
    })

    return data
}

exports.insertData = async (data) => {
    const protectedColumns = ['id']
    const result = await dbQueryHelper.insertData({
        table,
        data,
        protectedColumns
    })

    return result
}

exports.updateData = async (data, conditions) => {
    const protectedColumns = ['id']
    const result = await dbQueryHelper.updateData({
        table,
        data,
        protectedColumns,
        conditions
    })

    return result
}
