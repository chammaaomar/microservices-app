const UserCredentialsNotFoundError = require('../errors/user-credentials-not-found-error');

function getUserCredentials(context) {
	const { queries, email } = context;

	return queries.byEmail(email)
		.then(userCredentials => {
			if (!userCredentials) {
				throw new UserCredentialsNotFoundError('no record found with that email');
			}
			context.userCredentials = userCredentials;
			return context;
		})
}

module.exports = getUserCredentials;