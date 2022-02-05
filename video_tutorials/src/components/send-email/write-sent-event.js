const { v4: uuidv4 } = require('uuid');

function writeSentEvent(context) {
	const { email, emailId, command, messageStore } = context;
	const emailEntityStream = `sendEmail-${emailId}`;

	const sentEvent = {
		id: uuidv4(),
		type: 'Sent',
		metadata: {
			originStreamName: command.metadata.originStreamName,
			traceId: command.metadata.traceId,
			userId: command.metadata.userId,
		},
		data: {
			emailId,
			...email,
		},
	};

	return messageStore.write(emailEntityStream, sentEvent);
}

module.exports = writeSentEvent;