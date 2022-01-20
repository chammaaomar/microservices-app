const deserializeMssage = require('./deserialize-message');

// user-defined functions in message-db (postgresql)
const getLastMessageSql = 'SELECT * FROM get_last_stream_message($1)';
const getStreamMessagesSql = 'SELECT * FROM get_stream_messages($1, $2, $3)';
const getCategoryMessagesSql = 'SELECT * FROM get_category_messages($1, $2, $3)';

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

	return {
		read,
		readLastMessage,
	};
}

module.exports = createRead;