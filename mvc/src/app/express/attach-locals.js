function attachLocals(req, res, next) {
	res.locals.context = req.context;
	return next();
}

module.exports = attachLocals;