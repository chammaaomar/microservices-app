const deserializeMssage = require('./deserialize-message');

// user-defined functions in message-db (postgresql)
const getLastMessageSql = 'SELECT * FROM get_last_stream_message($1)';
const getStreamMessagesSql = 'SELECT * FROM get_stream_messages($1, $2, $3)';
const getCategoryMessagesSql = 'SELECT * FROM get_category_messages($1, $2, $3)';

// project reduces a log of events into a single state
// it's basically aggregating events to figure out a final net state
// for example, the log of events may be a log of transaction records for a given
// user, and the projection calculates the user's net assets after all these transactions
// in this example, the projection would handle 'Debited' and 'Credited' events
function project(events, projection) {
	return events.reduce((state, event) => {
		if (!projection[event.type]) {
			return state;
		}

		// modifies the state based on each event it sees
		return projection[event.type](state, event);
	}, projection.$init());
}

function createRead({ db }) {

	function readLastMessage(streamName) {
		return db.query(getLastMessageSql, [streamName])
			.then(res => deserializeMssage(res.rows[0]));
	}

	function read(streamName, fromPosition = 0, maxMessages = 1000) {
		const query = streamName.includes('-') ? getStreamMessagesSql : getCategoryMessagesSql;
		return db.query(query, [streamName, fromPosition, maxMessages])
			.then(res => res.rows.map(deserializeMssage));
	}

	// reads an entire stream and projects it into a usable state, since a stream is just
	// a log of diffs, we need to source state from these diffs, using projections
	// use carefully. Ensure stream being read is an appropriate entity stream with
	// not too many messages, since 'read' doesn't read the entire stream, but only the latest 1000 messages
	function fetch(streamName, projection) {
		return read(streamName).then(events => project(events, projection));
	}

	return {
		read,
		readLastMessage,
		fetch,
	};
}

module.exports = createRead;