const { v4: uuidv4 } = require('uuid');

function writeUserLoggedInEvent(context) {
	const {
		messageStore,
		traceId,
		userCredentials: { id: userId }
	} = context;

	const message = {
		id: uuidv4(),
		type: 'UserLoggedIn',
		metadata: {
			traceId,
			userId,
		},
		data: {
			userId,
		}
	}

	return messageStore.write(`authenticate-${userId}`, message)
		.then(() => context);
}

module.exports = writeUserLoggedInEvent;