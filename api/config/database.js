const mysql = require('mysql')

const db = {
    host     : process.env.DB_HOST || 'localhost',
    port     : process.env.DB_PORT || '',
	user     : process.env.DB_USER || 'root',
	password : process.env.DB_PASSWORD || '',
	name     : process.env.DB_NAME || 'db_pos'
}

const dbConn = mysql.createConnection({
	host               : db.host,
	port               : db.port,
	user               : db.user,
	password           : db.password,
	database           : db.name,
    // The milliseconds before a timeout occurs during the initial
    // connection to the MySQL server. (Default: 10000)
    connectTimeout     : 60000,
    // Force date types (TIMESTAMP, DATETIME, DATE) to be returned
    // as strings rather than inflated into JavaScript Date objects.
    // Can be true/false or an array of type names to keep as strings. (Default: false)
    dateStrings        : true,
    // Allow multiple mysql statements per query. Be careful with this,
    // it could increase the scope of SQL injection attacks. (Default: false)
	multipleStatements : true
})

dbConn.connect((err) => {
    // if (err) throw err;
    if (err) {
        console.error('error connecting: ' + err.stack)
        throw err
    }
})

module.exports = {
    db,
    dbConn
}