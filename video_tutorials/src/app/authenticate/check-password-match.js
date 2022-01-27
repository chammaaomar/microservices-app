const bcrypt = require('bcrypt');

const PasswordMismatchError = require('../errors/password-mismatch-error');

function checkPasswordMatch(context) {
	const { password, userCredentials: { passwordHash } } = context;
	return bcrypt.compare(password, passwordHash)
		.then(result => {
			if (!result) {
				throw new PasswordMismatchError('wrong password');
			}
			return context;
		})
}

module.exports = checkPasswordMatch;