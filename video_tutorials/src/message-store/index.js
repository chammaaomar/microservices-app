// index.js contains the module's public interface
// other files in module have the private implementation
const createRead = require('./read');
const createWrite = require('./write');
const configureCreateSubscription = require('./subscribe');

function createMessageStore({ db }) {
	const { read, readLastMessage } = createRead({ db });
	const write = createWrite({ db });
	const createSubscription = configureCreateSubscription({ read, readLastMessage, write });

	return {
		write,
		createSubscription,
		read,
		readLastMessage,
	};
}

module.exports = createMessageStore;