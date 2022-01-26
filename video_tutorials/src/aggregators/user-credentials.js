function createQueries({ db }) {
	// ON CONFLICT DO NOTHING ensures an idempotent insertion

	function createUserCredential(id, email, passwordHash) {
		const queryString = `
			INSERT INTO
				user_credentials(id, email, password_hash)
			VALUES
				(:id, :email, :passwordHash)
			ON CONFLICT DO NOTHING
		`
		return db.then(client => client.raw(queryString, { id, email, passwordHash }));
	};

	return {
		createUserCredential,
	};
};

// create idempotent handlers to handle Registered events
function createHandlers({ queries }) {

	return {
		Registered: event => 
			queries.createUserCredential(event.data.userId, event.data.email, event.data.passwordHash) 
	};
};

function build({ db, messageStore }) {
	const queries = createQueries({ db });
	const handlers = createHandlers({ queries });

	const subscription = messageStore.createSubscription({
		streamName: 'identity',
		handlers,
		subscriberId: 'aggregators:user-credentials',
	})

	function start() {
		return subscription.start();
	}

	return {
		queries,
		handlers,
		start,
	};
}

module.exports = build;