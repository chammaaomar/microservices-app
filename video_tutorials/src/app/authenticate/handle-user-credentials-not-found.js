const AuthenticationError = require('../errors/authentication-error');

function handleUserCredentialsNotFound(context) {
	// don't reveal to the user attempting to log in whether the email is registered in our system
	throw new AuthenticationError();
}

module.exports = handleUserCredentialsNotFound;