function mountRoutes(app, config) {
	app.use('/', config.homeApp.router);
}

module.exports = mountRoutes;