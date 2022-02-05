const emailSentProjection = {
	$init: () => ({
		isSent: false,
	}),

	Sent: (state, _event) => {
		state.isSent = true;

		return state;
	}
};

function checkEmailAlreadySent(context) {
	const { messageStore, emailId } = context;
	const emailEntityStream = `sendEmail-${emailId}`;

	return messageStore.fetch(emailEntityStream, emailSentProjection);
}

module.exports = checkEmailAlreadySent;