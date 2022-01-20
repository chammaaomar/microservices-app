const createKnexClient = require('./knex-client.js');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewing');


function createConfig({ env }) {

	// db is a promise that resolves with a db client, i.e. db.then(client => ...)
	const db = createKnexClient({
		connectionString: env.databaseUrl,
	})
	const homeApp = createHomeApp({ db });
	const recordViewingsApp = createRecordViewingsApp({ db });

	return {
		db,
		homeApp,
		recordViewingsApp,
	};
};

module.exports = createConfig;