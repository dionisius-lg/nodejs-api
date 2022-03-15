const _ = require('lodash')
const config = require('../config/index')
const fileHelper = require('../helper/files')
const fileTypeLibrary = require('file-type')
const fs = require('fs')
const multer = require('multer')
const response = require('../helper/response')
const uploadConfig = require('../config/upload')

/**
 * Single file upload with multer library
 * @param  {string} fieldName - file upload field
 * @param  {number} [fileSizeLimit=1] - file size in MB
 * @param  {string} [fileType='public'] - determined filename format and destination. @example 'public', 'ticket', 'info', 'emailOutbox', 'userPhoto'
 * @param  {string} fileFilter - determined file type image or not. fill with value 'image' for uploading image file.
 */
exports.singleFile = ({fieldName = '', fileSizeLimit = 1, fileType = 'public', fileFilter = ''}) => {
    return (req, res, next) => {
        const folderId = req.params.id
        const types = {
            public: uploadConfig.public,
            ticket: uploadConfig.ticketAttachment(folderId),
            info: uploadConfig.infoAttachment,
            emailOutbox: uploadConfig.emailOutboxAttachment(folderId),
            userPhoto: uploadConfig.userPhoto
        }
        const storage = types[fileType] || uploadConfig.public
        const limits = {
            fileSize: 1000000*fileSizeLimit // from MB to bytes
        }

        let multerOptions = { storage, limits }
        
        if (fileFilter == 'image') {
            multerOptions = { storage, limits, fileFilter: fileHelper.imageFilter }
        }

        if (fileFilter == 'excel') {
            multerOptions = { storage, limits, fileFilter: fileHelper.excelFilter }
        }
        
        let upload = multer(multerOptions).single(fieldName)
    
        upload(req, res, async (err) => {
            if (req.fileValidationError) {
                return response.sendBadRequest(res, req.fileValidationError)
            }
            else if (!req.file) {
                let message = 'Please select a file to upload'

                if (fileFilter == 'image') {
                    message = 'Please select an image to upload'
                }
                
                if (_.isObjectLike(err) && err.message !== undefined) {
                    message = err.message
                }

                return response.sendBadRequest(res, message)
            }
            else if (err instanceof multer.MulterError) {
                return response.sendBadRequest(res, err.message)
            }
            else if (err) {
                return response.sendBadRequest(res, err)
            }

            if (fileFilter == 'image') {
                const checkFile = await fileTypeLibrary.fromBuffer(req.file.buffer)
                const message = 'Only image files are allowed.'
                
                if (checkFile === undefined) {                    
                    return response.sendBadRequest(res, message)
                }

                const fileMime = checkFile['mime'].split('/')
                
                if (fileMime[0] == 'image') {
                    let buffer = await req.file.buffer
                    const ext = req.file.originalname.split('.').pop()
                    const randomNum = _.random(1000,5000)
                    const fileCreate = req.file.fieldname + '-' + randomNum + '-' + Date.now() + '.' + ext

                    fs.writeFile(`${config.userPhotoDir}/${fileCreate}`, buffer, (err) => {
                        if (err) {
                            console.error(err)
                            return response.sendInternalServerError(res)
                        }
                    })
                } else {
                    return response.sendBadRequest(res, message)
                }
            }
    
            next()
        })
    }
}

/**
 * Multiple file upload with multer library
 * @param  {string} fieldName - file upload field
 * @param  {number} [fileSizeLimit=1] - file size in MB (for one file)
 * @param  {number} fileMaxTotal - maximum total file in one time upload
 * @param  {string} [fileType='public'] - determined filename format and destination. @example 'public', 'ticket', 'info', 'emailOutbox', 'userPhoto'
 * @param  {string} fileFilter - determined file type image or not. fill with value 'image' for uploading image file.
 */
exports.multiFile = ({fieldName = '', fileSizeLimit = 1, fileMaxTotal = 1, fileType = 'public', fileFilter = ''}) => {
    return (req, res, next) => {
        const folderId = req.params.id
        const types = {
            public: uploadConfig.public,
            ticket: uploadConfig.ticketAttachment(folderId),
            info: uploadConfig.infoAttachment,
            emailOutbox: uploadConfig.emailOutboxAttachment(folderId),
            userPhoto: uploadConfig.userPhoto
        }
        const storage = types[fileType] || uploadConfig.public
        const limits = {
            fileSize: 1000000*fileSizeLimit // from MB to bytes
        }

        let multerOptions = { storage, limits }

        if (fileFilter == 'image') {
            multerOptions = { storage, limits, fileFilter: fileHelper.imageFilter }
        }

        let upload = multer(multerOptions).array(fieldName, fileMaxTotal)

        upload(req, res, function(err) {
            if (req.fileValidationError) {
                return response.sendBadRequest(res, req.fileValidationError)
            }
            else if (!req.files) {
                let message = 'Please select a file to upload'

                if (fileFilter == 'image') {
                    message = 'Please select an image to upload'
                }
                
                if (_.isObjectLike(err) && err.message !== undefined) {
                    message = err.message
                }

                return response.sendBadRequest(res, message)
            }
            else if (err instanceof multer.MulterError) {
                return response.sendBadRequest(res, err.message)
            }
            else if (err) {
                return response.sendBadRequest(res, err)
            }

            next()
        })
    }
}