const createKnexClient = require('./knex-client');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewing');

const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');

const createHomePageAggregator = require('./aggregators/home-page');

/**
 * This function wirtes up all the pieces of our architecture:
 * Connects apps to the message store
 * Connects the message store to components and aggregators
 * Connects aggregators to the View Data 
 * @param {Object} param0.env Environment variables 
 * @returns {Object}
 */
function createConfig({ env }) {

	// knexClient is a promise that resolves with a db client, i.e. knexClient.then(client => ...)
	const knexClient = createKnexClient({
		connectionString: env.databaseUrl,
	})

	// lower level postgres client for interfacing with the message store
	const postgresClient = createPostgresClient({
		connectionString: env.messageStoreConnectionString,
	});
	const messageStore = createMessageStore({ db: postgresClient });
	const homeApp = createHomeApp({ db: knexClient });
	const recordViewingsApp = createRecordViewingsApp({ messageStore });

	const homePageAggregator = createHomePageAggregator({ db: knexClient, messageStore });

	// aggregators or projectors take the state transitions data from the message store (the audit trail)
	// and project it into useful shapes for the View Data rendered to the user
	// View Data in our case is also a postgres db
	const aggregators = [
		homePageAggregator,
	]

	// in this architecture, components receive async commands from the message store and carry
	// out business functionality
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