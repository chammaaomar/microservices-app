const createSend = require('./send');
const writeFailedEvent = require('./write-failed-event');
const writeSentEvent = require('./write-sent-event');
const checkEmailAlreadySent = require('./check-email-already-sent');

function createHandlers({
	messageStore,
	justSendIt,
	systemSenderEmailAddress,
}) {
	function handleSend(command) {
		const {
			to,
			subject,
			html,
			text,
			emailId,
		} = command.data;

		const email = {
			from: systemSenderEmailAddress,
			to,
			subject,
			html,
			text,
		};

		const context = { email, emailId, command, messageStore };

		const { isSent } = checkEmailAlreadySent(context);

		// best-effort idempotence; not guaranteed because we write the 'Sent' event after
		// actually sending the email. This is a trade-off we accept.
		if (isSent) {
			return;
		}

		return justSendIt(email)
			.then(() => writeSentEvent(context))
			.catch(err => {
				if (err.name === 'SendError') {
					return writeFailedEvent(err, context);
				}
				// otherwise throw error
				throw err;
			});
	}

	return {
		handleSend,
	};
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

module.exports = build;