const { v4: uuidv4 } = require('uuid');
const loadRegisterState = require('./load-register-state');

function createHandlers({ messageStore }) {

	function handleRegister(command) {

		const userIdentityStream = `identity-${command.data.userId}`;

		// reconstruct user state based on all 'identity'-category events for the given user
		const { isRegistered } = messageStore.fetch(userIdentityStream, loadRegisterState);
		
		// idempotence
		if (isRegistered) {
			return;
		}

		const message = {
			id: uuidv4(),
			type: 'Registered',
			metadata: {
				userId: command.metadata.userId,
				traceId: command.metadata.traceId,
			},
			data: {
				userId: command.data.userId,
				email: command.data.email,
				passwordHash: command.data.passwordHash,
			}
		};

		return messageStore.write(userIdentityStream, message);
	}

	return {
		Register: handleRegister,
	};
}

function build({ messageStore }) {

	const handlers = createHandlers({ messageStore });

	const subscription = messageStore.createSubscription({
		streamName: 'identity:command',
		handlers,
		subscriberId: 'components:identity:command',
	})
	
	const start = subscription.start;

	return {
		handlers,
		start,
	}
}

module.exports = build;