const VersionConflictError = require('./version-conflict-error');
const versionConflictErrorRegex = /^Wrong.*Stream Version: (\d+)\)/;
const writeFunctionSql = 'SELECT message_store.write_message($1, $2, $3, $4, $5, $6)';

function createWrite({ db }) {
	return (streamName, message, expectedVersion) => {
		if (!message.type) {
			throw new Error('Messages must have a type');
		}
		const values = [
			message.id,
			streamName,
			message.type,
			message.data,
			message.metadata,
			expectedVersion,
		];
		// implement optimistic concurrency control; no need for pessimistic concurrency
		// control with locks. This is useful in cases where low data contention is expected
		return db.query(writeFunctionSql, values)
			.catch(err => {
				const errorMatch = error.message.match(versionConflictErrorRegex);
				const notVersionConflict = errorMatch === null;

				if (notVersionConflict) {
					throw err;
				}

				// handle concurrent writes to different instances of same component
				// to the same stream
				// the first element in the errorMatch array is the whole match
				// the second element is the group captured by (\d+)
				const actualVersion = parseInt(errorMatch[1], 10);
				const versionConflictError = new VersionConflictError(streamName, expectedVersion, actualVersion);
				versionConflictError.stack = err.stack;
				throw versionConflictError;
			});
	};
}

module.exports = createWrite;