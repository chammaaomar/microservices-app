const createKnexClient = require('./knex-client');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewing');
const createRegisterUsersApp = require('./app/register-users');
const createAuthenticateApp = require('./app/authenticate');

const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');

const createHomePageAggregator = require('./aggregators/home-page');
const createUserCredentialsAggregator = require('./aggregators/user-credentials');

const createIdentityComponent = require('./components/identity');

/**
 * This function wires up all the pieces of our architecture:
 * - Connects apps to the message store
 * - Connects the message store to components and aggregators
 * - Connects aggregators to the View Data 
 * @param {Object} param0.env Environment variables 
 * @returns {Object}
 */
function createConfig({ env }) {

	// knexClient is a promise that resolves with a db client, i.e. knexClient.then(client => ...)
	// this represents the View Data, the eventually consistent state constructed by aggregators
	// out of the state transitions log in the message store
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
	const registerUsersApp = createRegisterUsersApp({ db: knexClient, messageStore });
	const authenticateApp = createAuthenticateApp({ db: knexClient, messageStore });

	const homePageAggregator = createHomePageAggregator({ db: knexClient, messageStore });
	const userCredentialsAggregator = createUserCredentialsAggregator({ db: knexClient, messageStore });

	const identityComponent = createIdentityComponent({ messageStore });

	// aggregators or projectors take the state transitions data from the message store (the audit trail)
	// and project it into useful shapes for the View Data rendered to the user
	// View Data in our case is also a postgres db
	const aggregators = [
		homePageAggregator,
		userCredentialsAggregator,
	]

	// in this architecture, components receive async commands from the message store and carry
	// out business functionality
	const components = [
		identityComponent,
	]

	return {
		db: knexClient,
		homeApp,
		recordViewingsApp,
		registerUsersApp,
		authenticateApp,
		homePageAggregator,
		aggregators,
		components,
	};
};

module.exports = createConfig;