const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
function hashPassword(context) {
	const { attributes: { password } } = context;

	return bcrypt.hash(password, SALT_ROUNDS)
		.then(passwordHash => {
			context.attributes.passwordHash = passwordHash;
			return context;
		})
}

module.exports = hashPassword;