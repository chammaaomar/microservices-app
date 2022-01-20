const VersionConflictError = require('./version-conflict-error');
const versionConflictErrorRegex = /^Wrong.*Stream Version: (\d+)\)/;
// user-defined function in message-db (postgresql)
const writeFunctionSql = 'SELECT message_store.write_message($1, $2, $3, $4, $5, $6)';

/**
 * Returns a function to read from a stream in the message store
 * @param {{ query: (string, *[]) => PromiseLike<Object> }} param0.db message store client. Needs to implement the
 * specified interface 
 * @returns 
 */
function createWrite({ db }) {
	/**
	 * @param {string} streamName name of stream to read from
	 * @param {Object} message message to write to @streamName
	 * @param {number} [expectedVersion] last observed state of the stream, used for optimsitic concurrency control.
	 * The write will fail if this is provided, and the actual version has diverged from this expected version
	 * @throws {VersionConflictError} in case of race condition. Throws other errors in case of DB write failure
	 */
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