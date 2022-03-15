const _ = require('lodash')
const config = require('../config/index')
const fs = require('fs')
const multer = require('multer')

exports.public = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = config.publicDir
        cb(null, path)
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        const ext = file.originalname.split('.').pop()
        const randomNum = _.random(1000,5000)
        cb(null, file.fieldname + '-' + randomNum + '-' + Date.now() + '.' + ext)
    }
})

exports.userPhoto = multer.memoryStorage({
    destination: function(req, file, cb) {
        const path = config.publicDir
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        const ext = file.originalname.split('.').pop()
        const randomNum = _.random(1000,5000)
        cb(null, file.fieldname + '-' + randomNum + '-' + Date.now() + '.' + ext)
    }
})