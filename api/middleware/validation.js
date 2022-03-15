const fs = require('fs')
const response = require('../helper/response')

/**
 * Validation for given schema
 * @param  {Object} schema - schema object screnario and message
 * @param  {string} property - request property. @example 'body', 'params'
 * @param  {boolean} [file=false] - determined condition for file upload
 */
const validation = (schema, property, file = false) => { 
	return (req, res, next) => {
		const { error } = schema.validate(req[property])
		const valid = error == null
		
		if (valid) { 
			next() 
		} else { 
			const { details } = error
			const message = details.map(i => i.message).join(',')

			// check if file upload
			if (file === true) {
				// if single file
				if (req.file !== undefined) {
					const dir = req.file.destination
					const filename = req.file.filename
					const file = `${dir}/${filename}`

					// delete file that already uploaded by multer middleware
					if (fs.existsSync(file)) {
						fs.unlinkSync(file)
					}
				}
				
				// if multiple files
				if (req.files !== undefined) {
					for (key in req.files) {
						const dir = req.files[key].destination
						const filename = req.files[key].filename
						const file = `${dir}/${filename}`

						// delete files that already uploaded by multer middleware
						if (fs.existsSync(file)) {
							fs.unlinkSync(file)
						}
					}					
				}
			}

			return response.sendBadRequest(res, message)
		} 
	} 
}

module.exports = validation