const validate = require('validate.js');

const ValidationError = require('../errors/validation-error');

// superficial validation handled at application layer
// more validation is done by the Identity component
// NOTE: password length constraint cannot be done by identity component, since only hashed password is sent around
const constraints = {
	email: {
		email: true,
		presence: true,
	},

	password: {
		length: { minimum: 8 },
		presence: true,
	}
};

function validateFunc(context) {
	const validationErrors = validate(context.attributes, constraints);
	if (validationErrors) {
		throw new ValidationError(validationErrors);
	}
	return context;
}

module.exports = validateFunc;