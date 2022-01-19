const createKnexClient = require('./knex-client');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewing');

const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');


function createConfig({ env }) {

	// knexClient is a promise that resolves with a db client, i.e. knexClient.then(client => ...)
	const knexClient = createKnexClient({
		connectionString: env.databaseUrl,
	})
	const postgresClient = createPostgresClient({
		connectionString: env.messageStoreConnectionString,
	});
	const messageStore = createMessageStore({ db: postgresClient });
	const homeApp = createHomeApp({ db: knexClient });
	const recordViewingsApp = createRecordViewingsApp({ messageStore });

	return {
		db,
		homeApp,
		recordViewingsApp,
	};
};

module.exports = createConfig;