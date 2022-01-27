const { v4: uuidv4 } = require('uuid');

const AuthenticationError = require('../errors/authentication-error');

function handlePasswordMismatch(context) {
	const {
		messageStore,
		traceId,
		userCredentials: {
			id: userId,
		}
	} = context;
	
	// write UserLoginFailed event
	const message = {
		id: uuidv4(),
		type: 'UserLoginFailed',
		// don't write metadata because we don't know the actual user
		metadata: {
			traceId,
		},
		data: {
			userId,
			reason: 'wrong password',
		},
	};

	return messageStore.write(`authenticate-${userId}`, message)
		.then(() => { throw new AuthenticationError(); })
}

module.exports = handlePasswordMismatch;