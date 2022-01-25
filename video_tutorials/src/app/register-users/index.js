const Bluebird = require('bluebird');
const { v4: uuidv4 } = require('uuid');
const camelCaseKeys = require('camelcase-keys');
const express = require('express');
const bodyParser = require('body-parser');

const ValidationError = require('../errors/validation-error');
const validate = require('./validate');
const loadExistingIdentity = require('./load-existing-identity');
const ensureNoExistingIdentity = require('./ensure-no-existing-identity');
const hashPassword = require('./hash-password.js');
const writeRegisterCommand = require('./write-register-command');

// queries query the eventually consistent View Data, which is sourced using aggregators pulling from the message store
// there's a concern here of user collisions, because we're de-duping using
// eventually consistent state data, but it's OK because eventually consistent
// is usually on othe order of tens of milliseconds and pretty unlikely
// for two users to simultaneously register using the same email.
// also in our architecture, applications can only read from View Data, they cannot read from the message Store.
// the message Store is pulled by components and aggregators, and applications only write to it, not read from it
function createQueries({ db }) {

	function byEmail(email) {
		return db
			.then(client =>
				client('user_credentials')
				.where({ email })
				.limit(1)
			)
			.then(camelCaseKeys)
			.then(rows => rows[0])
	}

	return { byEmail };
}

// actions write messages to the message store, then it's picked up and handled by the Identity component
function createActions({ messageStore, queries }) {
	function registerUser(traceId, attributes) {
		const context = { attributes, traceId, messageStore, queries };
		return Bluebird.resolve(context)
			.then(validate)
			.then(loadExistingIdentity)
			.then(ensureNoExistingIdentity)
			.then(hashPassword)
			.then(writeRegisterCommand);
	}

	return {
		registerUser,
	};
}

// constructs the Express request handlers
function createHandlers({ actions }) {
	function handleRegisterationForm(req, res) {
		// generating a userId as soon as possible, before the user even attempted to register
		const userId = uuidv4();

		res.render('register-users/templates/register', { userId });
	}

	function handleRegistrationComplete(req, res) {
		return res.render('register-users/templates/registration-complete');
	}

	function handleRegisterUser(req, res, next) {
		const attributes = {
			id: req.body.id,
			email: req.body.email,
			password: req.body.password,
		};

		return actions.
			registerUser(req.context.traceId, attributes)
			.then(() => res.redirect(301, 'register/registration-complete'))
			// property of Bluebird promises: with a catch, you can specify the kind of error
			// you are catching
			.catch(ValidationError, err => 
				res.status(400)
				.render(
					'register-users/templates/register',
					{ userId: attributes.id, errors: err.errors }
				))
			.catch(next);
	}

	return {
		handleRegisterationForm,
		handleRegistrationComplete,
		handleRegisterUser
	};
}

function build({ db, messageStore }) {

	const queries = createQueries({ db });
	const actions = createActions({ messageStore, queries });
	const handlers = createHandlers({ actions });

	const router = express.Router();

	router.route('/')
		.get(handlers.handleRegisterationForm)
		.post(
			bodyParser.urlencoded({ extended: false }),
			handlers.handleRegisterUser,
		)

	router.route('/registration-complete')
		.get(handlers.handleRegistrationComplete)

	return { actions, handlers, queries, router };
}

module.exports = build;