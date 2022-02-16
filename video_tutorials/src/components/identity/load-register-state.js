const identityProjection = {
	// the initial user state with respect to identity
	$init: () => ({
		id: null,
		email: null,
		isRegistered: false,
	}),

	// When handling the RegisterUser command, we replay all the events in the identity entity stream
	// for this particular user. If we find a Registered event, we transition into the state
	// isRegistered: true. This enables us to handle the RegisterUser commands idempotently.
	// Other events we can use to transition the state machine into other states: UserDeactivated
	// for when the user deactivates their account 
	Registered: (state, event) => {
		state.id = event.data.userId;
		state.email = event.data.email;
		state.isRegistered = true;

		return state;
	},
};

module.exports = identityProjection;