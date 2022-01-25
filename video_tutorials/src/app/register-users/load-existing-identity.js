function loadExistingIdentity(context) {
	const { attributes, queries } = context;

	return queries.
		byEmail(attributes.email)
		.then(existingIdentity => {
			context.existingIdentity = existingIdentity;
			return context;
		});
};

module.exports = loadExistingIdentity;