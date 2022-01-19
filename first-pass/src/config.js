const createKnexClient = require('./knex-client.js');
const createHomeApp = require('./app/home');


function createConfig({ env }) {

	// db is a promise that resolves with a db client, i.e. db.then(client => ...)
	const db = createKnexClient({
		connectionString: env.databaseUrl,
	})
	const homeApp = createHomeApp({ db });

	return {
		db,
		homeApp,
	};
};

module.exports = createConfig;