const { v4: uuidv4 } = require('uuid');

function writeFailedEvent(err, context) {
	const { email, emailId, command, messageStore } = context;
	const emailEntityStream = `sendEmail-${emailId}`;

	const sendFailedEvent = {
		id: uuidv4(),
		type: 'Failed',
		metadata: {
			originStreamName: command.metadata.originStreamName,
			traceId: command.metadata.traceId,
			userId: command.metadata.userId,
		},
		data: {
			emailId,
			...email,
			reason: err.message,
		},
	};
	
	return messageStore.write(emailEntityStream, sendFailedEvent);
};

module.exports = writeFailedEvent;