const _ = require('lodash')
const { dbQueryHelper } = require('./../helper')
const table = 'user_level_modules'

/**
 * Get All Data
 * @param {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
exports.getAll = async (conditions) => {
    let customConditions = [
        'user_levels.is_active = 1',
        'modules.is_active = 1'
    ]

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
        'user_levels.name AS user_level',
        'modules.name AS module',
        'modules.module_type_id AS module_type_id',
        'module_types.name AS module_type',
        'GROUP_CONCAT(user_level_modules.module_activity_id) AS module_activity_id',
        `(SELECT GROUP_CONCAT(CONCAT_WS(' ', module_activities.name, modules.name) SEPARATOR ', ') FROM module_activities
            WHERE INSTR(CONCAT(' ,', GROUP_CONCAT(user_level_modules.module_activity_id), ','), CONCAT(',', module_activities.id, ',')) > 1
            AND module_activities.is_active = 1) AS module_activity`
    ]

    const join = [
        `LEFT JOIN user_levels ON user_levels.id = ${table}.user_level_id`,
        `LEFT JOIN modules ON modules.id = ${table}.module_id`,
        `LEFT JOIN module_types ON module_types.id = modules.module_type_id`
    ]

    const columnSelect = []
    const columnDeselect = [
        'module_activity_id'
    ] // will not be provide in return

    const conditionTypes = {
        'like': [],
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
    let customConditions = [
        'user_levels.is_active = 1',
        'modules.is_active = 1'
    ]

    if (conditions.hasOwnProperty('not_id')) {
        if (!_.isEmpty(conditions['not_id']) && !_.isNaN(conditions['not_id'])) {
            customConditions.push(`${table}.id != ${conditions['not_id']}`)
        }

        delete conditions['not_id']
    }

    const customColumns = [
        'user_levels.name AS user_level',
        'modules.name AS module',
        'modules.module_type_id AS module_type_id',
        'module_types.name AS module_type',
        'GROUP_CONCAT(user_level_modules.module_activity_id) AS module_activity_id',
        `(SELECT GROUP_CONCAT(CONCAT_WS(' ', module_activities.name, modules.name) SEPARATOR ', ') FROM module_activities
            WHERE INSTR(CONCAT(' ,', GROUP_CONCAT(user_level_modules.module_activity_id), ','), CONCAT(',', module_activities.id, ',')) > 1
            AND module_activities.is_active = 1) AS module_activity`
    ]

    const join = [
        `LEFT JOIN user_levels ON user_levels.id = ${table}.user_level_id`,
        `LEFT JOIN modules ON modules.id = ${table}.module_id`,
        `LEFT JOIN module_types ON module_types.id = modules.module_type_id`
    ]

    const columnSelect = []
    const columnDeselect = [
        'module_activity_id'
    ] // will not be provide in return

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
