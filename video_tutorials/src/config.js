const createKnexClient = require('./knex-client');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewing');

const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');

const createHomePageAggregator = require('./aggregators/home-page');


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

	const homePageAggregator = createHomePageAggregator({ db: knexClient, messageStore });

	const aggregators = [
		homePageAggregator,
	]

	const components = [
		
	]

	return {
		db: knexClient,
		homeApp,
		recordViewingsApp,
		homePageAggregator,
		aggregators,
		components,
	};
};

module.exports = createConfig;