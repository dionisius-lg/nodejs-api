const { dbQueryHelper } = require('./../helper')
const table = 'users'
const table_view = 'view_users'

/**
 * Get All Data
 * @param {Object.<string, string|number>} conditions - Query conditions. @example {columnName: 'columnValue'}
 * @returns {Promise.<Object.<string, string|number|boolean|Object>>} - data result
 */
exports.getAll = async (conditions) => {
    let customConditions = []
    if (conditions.alias_id !== undefined) {
        customConditions.push(`id = ${conditions.alias_id}`)
    }
console.log(conditions, 'asdasdasd')
    const customColumns = [
        `user_levels.name AS user_level`
    ]

    const join = [
        `LEFT JOIN user_levels ON user_levels.id = ${table}.user_level_id`
    ]

    const columnSelect = []
    const columnDeselect = ['password'] // will not be provide in return

    const conditionTypes = {
        'like': ['username', 'email', 'fullname'],
        'date': ['birth_date'],
        'time': []
    }

    const data = await dbQueryHelper.getAll({
        table,
        conditions,
        customConditions,
        customColumns,
        join,
        columnSelect,
        columnDeselect,
        conditionTypes
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

    const customColumns = [
        `user_levels.name AS user_level`
    ]

    const join = [
        `LEFT JOIN user_levels ON user_levels.id = ${table}.user_level_id`
    ]

    const columnSelect = []
    const columnDeselect = [] // will not be provide in return

    const conditionTypes = {
        'like': ['username', 'email'],
        'date': ['birth_date']
    }

    const data = await dbQueryHelper.getDetail({
        table,
        conditions,
        customConditions,
        customColumns,
        join,
        columnSelect,
        columnDeselect,
        conditionTypes
    })

    return data
}

exports.getOnlineUser = async (conditions) => {
    let customConditions = [`users.user_activity_id = 5`]
    const columnSelect = [`id`,`username`,`extensions.ext_no`]
    const customColumns = [
        
        `extensions.ext_no AS ext`
    ]
    const join = [
        `LEFT JOIN extensions ON extensions.user_id = ${table}.id`,
          ]

          
    const data = await dbQueryHelper.getAll({table, conditions, customConditions ,   columnSelect, customColumns,    join})
    console.log(data)
    return data
}


exports.getAvailableUsers = async (conditions) => {
    let customConditions = [`users.user_activity_id = 2`]
    const columnSelect = [`id`,`username`,`extensions.ext_no`]
    const customColumns = [
        
        `extensions.ext_no AS ext`
    ]
    const join = [
        `LEFT JOIN extensions ON extensions.user_id = ${table}.id`,
          ]

          
    const data = await dbQueryHelper.getAll({table, conditions, customConditions ,   columnSelect, customColumns,    join})
    console.log(data)
    return data
}



exports.getAllModule = async (conditions) => {
    let customConditions = []
    const columnDeselect = ['id', 'user_level_id', 'is_active'] // will not be provide in return
    const conditionTypes = {
        'like': [],
        'date': []
    }
    const customColumns = [
        `modules.code AS code`,
        `modules.name AS name`
    ]
    const join = [
        `LEFT JOIN users ON users.user_level_id = user_level_modules.user_level_id`,
        `LEFT JOIN modules ON modules.id = user_level_modules.module_id`
    ]
    const groupBy = [`user_level_modules.id`]
    customConditions = [`users.id = ${conditions.id}`, `user_level_modules.is_active = 1`, `modules.is_active = 1`]

    const data = await dbQueryHelper.getAll({table: 'user_level_modules', customConditions, conditionTypes, columnDeselect, customColumns, join, groupBy})
    
    return data
}

exports.insertData = async (data) => {
    const protectedColumns = ['id']
    const result = await dbQueryHelper.insertData({table, data, protectedColumns})
    
    return result
}

exports.updateData = async (data, conditions) => {
    //const protectedColumns = ['id', 'password', 'is_password_request', 'verification_code', 'password_exp_date']
    const result = await dbQueryHelper.updateData({table, data, conditions})
    
    return result
}

exports.updatePassword = async (data, conditions) => {
    const protectedColumns = ['id']
    const result = await dbQueryHelper.updateData({table, data, conditions, protectedColumns})
    
    return result
}

exports.uploadPhoto = async (data, conditions) => {
    const result = await dbQueryHelper.updateData({table, data, conditions})
    
    return result
}
