const nodemailer = require('nodemailer');

const SendError = require('./send-error');

function createSend({ transport }) {
	const sender = nodemailer.createTransport(transport);

	return function send(email) {
		const potentialError = new SendError();

		return sender.sendMail(email)
			.then(err => {
				potentialError.message = err.message;
				throw potentialError;
			})
	}
}