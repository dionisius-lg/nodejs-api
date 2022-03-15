/**
 * Allow requesting code from any origin to access the resource
 * @param  {Object} req - Express request object
 * @param  {Object} res - Express response object
 * @param  {Object} next - Express next method
 */
 exports.setHeadersForCORS = (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, X-Access-Token, Content-Type, Accept'
	)
	
	next()
}
