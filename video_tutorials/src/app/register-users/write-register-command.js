const { v4: uuidv4 } = require('uuid');

function writeRegisterCommand(context) {
	const {
		traceId,
		attributes: {
			id: userId,
			email,
		},
		passwordHash,
	} = context;

	const identityCommandStream = `identity:command-${userId}`;
	const command = {
		id: uuidv4(),
		type: 'Register',
		metadata: {
			userId,
			traceId,
		},
		data: {
			userId,
			email,
			passwordHash,
		}
	}

	return context.messageStore.write(identityCommandStream, command);
}

module.exports = writeRegisterCommand;