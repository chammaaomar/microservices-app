function createHandlers({ queries }) {
	return {
		videoViewed: event => queries.incrementVideosWatched(event.globalPosition),
	};
}

/**
 * Queries are used by aggregators to aggregate the state transitions in the message store
 * into a useful state for users. Here for example, the videosWatched integer is used in the pug
 * template to render how many videos have been watched
 * @param {PromiseLike<{ raw: (string, Object) => PromiseLike<Object> }} param0.db a promise which resolves
 * with an object which satisfies the specified interface
 * @returns {PromiseLike<Object>}
 */
function createQueries({ db }) {

	/**
	 * Increments the 'videosWatched' count. Idempotent. If message's global position
	 * is less than the lastViewProcessed stored in the 'pages' View Data table,
	 * that means it's already been processed and shouldn't be processed again
	 * @param {number} globalPosition global position of message in message store
	 * used for idempotence. Super important since we can't guarantee exactly-once delivery
	 * @returns {PromiseLike<Object>}
	 */
	function incrementVideosWatched(globalPosition) {
		const queryString = `
			UPDATE
				pages
			SET
				page_data = jsonb_set(
					jsonb_set(
						page_data,
						'{videosWatched}',
						((page_data ->> 'videosWatched')::int + 1)::text::jsonb
					),
					'{lastViewProcessed}',
					:globalPosition::text::jsonb
				)
			WHERE
				page_name='home' AND
				(page_data ->> 'lastViewProcessed')::int < :globalPosition
		`

		return db.then(client => client.raw(queryString, { globalPosition }));
	}

	/**
	 * Creates the row in View Data 'pages' table if it doesn't already exist 
	 * @returns {PromiseLike<Object>}
	 */
	function ensureHomePageExists() {
		const initialData = {
			pageData: { lastViewProcessed: 0, videosWatched: 0 }
		};

		const queryString = `
			INSERT INTO
				pages(page_name, page_data)
			VALUES
				('home', :pageData)
			ON CONFLICT DO NOTHING
		`;

		return db.then(client => client.raw(queryString, initialData));
	}

	return {
		incrementVideosWatched,
		ensureHomePageExists,
	};
}

function build({ db, messageStore }) {
	const queries = createQueries({ db });
	const handlers = createHandlers({ queries });

	const subscription = messageStore.createSubscription({
		streamName: 'viewing',
		handlers,
		subscriberId: 'aggregators:home-page',
	})

	function init() {
		return queries.ensureHomePageExists();
	}

	function start() {
		init().then(subscription.start);
	}

	return {
		queries,
		handlers,
		init,
		start,
	};
}

module.exports = build;