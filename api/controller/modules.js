const _ = require('lodash')
const { dbQueryHelper } = require('./../helper')
const table = 'modules'

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

    const customColumns = [
        'module_types.name AS module_type',
        'module_types.code AS module_type_code',
        `(SELECT GROUP_CONCAT(module_activities.id) FROM module_activities
            WHERE module_activities.module_id = ${table}.id AND module_activities.is_active = 1) AS module_activities_id`,
        `(SELECT GROUP_CONCAT(module_activities.name SEPARATOR ', ') FROM module_activities
            WHERE module_activities.module_id = ${table}.id AND module_activities.is_active = 1) AS module_activity`,
        `(SELECT GROUP_CONCAT(module_activities.code SEPARATOR ', ') FROM module_activities
            WHERE module_activities.module_id = ${table}.id AND module_activities.is_active = 1) AS module_activity_code`,
        'create_users.fullname AS create_user',
        'update_users.fullname AS update_user'
    ]

    const join = [
        `LEFT JOIN module_types ON module_types.id = ${table}.module_type_id`,
        `LEFT JOIN users AS create_users ON create_users.id = ${table}.create_user_id`,
        `LEFT JOIN users AS update_users ON update_users.id = ${table}.update_user_id`
    ]

    const columnSelect = []
    const columnDeselect = [] // will not be provide in return

    const conditionTypes = {
        'like': ['name'],
        'date': ['create_date', 'update_date'],
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

    const customColumns = [
        'module_types.name AS module_type',
        'module_types.code AS module_type_code',
        `(SELECT GROUP_CONCAT(module_activities.id) FROM module_activities
            WHERE module_activities.module_id = ${table}.id AND module_activities.is_active = 1) AS module_activities_id`,
        `(SELECT GROUP_CONCAT(module_activities.name SEPARATOR ', ') FROM module_activities
            WHERE module_activities.module_id = ${table}.id AND module_activities.is_active = 1) AS module_activity`,
        `(SELECT GROUP_CONCAT(module_activities.code SEPARATOR ', ') FROM module_activities
            WHERE module_activities.module_id = ${table}.id AND module_activities.is_active = 1) AS module_activity_code`,
        'create_users.fullname AS create_user',
        'update_users.fullname AS update_user'
    ]

    const join = [
        `LEFT JOIN module_types ON module_types.id = ${table}.module_type_id`,
        `LEFT JOIN users AS create_users ON create_users.id = ${table}.create_user_id`,
        `LEFT JOIN users AS update_users ON update_users.id = ${table}.update_user_id`
    ]

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
