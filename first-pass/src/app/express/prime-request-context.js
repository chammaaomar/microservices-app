const { v4: uuidv4 } = require('uuid');

function primeRequestContext(req, res, next) {
	req.context = {
		traceId: uuidv4()
	};

	return next();
}

module.exports = primeRequestContext;