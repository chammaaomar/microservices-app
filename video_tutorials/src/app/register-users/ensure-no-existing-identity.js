const ValidationError = require('../errors/validation-error');

function ensureNoExistingIdentity(context) {
	if (context.existingIdentity) {
		throw new ValidationError({ email: 'already exists' });
	}
	return context;
};

module.exports = ensureNoExistingIdentity;