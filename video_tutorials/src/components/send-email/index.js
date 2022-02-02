const createSend = require('./send');

function createHandlers({
	messageStore,
	justSendIt,
	systemSenderEmailAddress,
}) {
	function handleSend(email) {
		
	}

	return {
		handleSend,
	}
}

function build({
	messageStore,
	systemSenderEmailAddress,
	transport,
}) {

	const justSendIt = createSend({ transport });
	const handlers = createHandlers({ messageStore, justSendIt, systemSenderEmailAddress });
	const subscription = messageStore.createSubscription({
		streamName: 'sendEmail:command',
		handlers,
		subscriberId: 'components:sendEmail',
	});

	function start() {
		subscription.start();
	}

	return {
		handlers,
		start,
	}
}