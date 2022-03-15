const fs = require('fs')

/**
 * Filter file for multer library
 * @param {*} req 
 * @param {*} file 
 * @param {*} cb 
 */
exports.imageFilter = function(req, file, cb) {
    const mimetype = file.mimetype
    const filetype = mimetype.split('/')
    
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/) || filetype[0] != 'image') {      
        req.fileValidationError = 'Only image files are allowed'
        return cb(new Error('Only image files are allowed'), false)
    }
    
    cb(null, true)
}


/**
 * Filter xls/xlsx file for multer library
 * @param {*} req 
 * @param {*} file 
 * @param {*} cb 
 */
 exports.excelFilter = function(req, file, cb) {
    const mimetype = file.mimetype
    const filetype = mimetype.split('/')
    
    // Accept xls/xlsx only
    if (!file.originalname.match(/\.(xls|xlsx)$/)) {      
        req.fileValidationError = 'Only  xls/xlsx files are allowed'
        return cb(new Error('Only  xls/xlsx files are allowed'), false)
    }
    
    cb(null, true)
}
