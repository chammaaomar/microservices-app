const identityProjection = {
	// the initial user state with respect to identity
	$init: () => ({
		id: null,
		email: null,
		isRegistered: false,
	}),


	Registered: (state, event) => {
		state.id = event.data.userId;
		state.email = event.data.email;
		state.isRegistered = true;

		return state;
	},
};

module.exports = identityProjection;