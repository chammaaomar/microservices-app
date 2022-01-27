const express = require('express');
const bodyParser = require('body-parser');
const camelCaseKeys = require('camelcase-keys');
const Bluebird = require('bluebird');

const getUserCredentials = require('./get-user-credentials.js');
const checkPasswordMatch = require('./check-password-match.js');
const writeUserLoggedInEvent = require('./write-user-logged-in-event');


const UserCredentialsNotFoundError = require('../errors/user-credentials-not-found-error');
const PasswordMismatchError = require('../errors/password-mismatch-error');

const handleUserCredentialsNotFound = require('./handle-user-credentials-not-found');
const handlePasswordMismatch = require('./handle-password-mismatch');

const AuthenticationError = require('../errors/authentication-error');

function buildQueries({ db }) {

	function byEmail(email) {
		
		return db.then(client => 
			client('user_credentials')
			.where({ email })
			.limit(1)
			.then(camelCaseKeys)
			.then(rows => rows[0])
			);
	}

	return { byEmail };
}

function buildActions({ messageStore, queries }) {

	function authenticateUser(email, password, traceId) {
		const context = { email, password, traceId, messageStore, queries };
		return Bluebird.resolve(context)
			.then(getUserCredentials)
			.then(checkPasswordMatch)
			.then(writeUserLoggedInEvent)
			// blue bird allows catching different kinds of errors
			.catch(UserCredentialsNotFoundError, () => handleUserCredentialsNotFound(context))
			.catch(PasswordMismatchError, () => handlePasswordMismatch(context));
	}

	return {
		authenticateUser,
	}
}

function buildHandlers({ actions }) {

	function handleLoginAttempt(req, res, next) {
		const {
			body: {
				email,
				password,
			},
			context: {
				traceId,
			},
		} = req;
		return actions.authenticateUser(email, password, traceId)
			.then(context => {
				// attach user Id to cookie
				req.session.userId = context.userCredentials.id;
				res.redirect('/');
			})
			.catch(AuthenticationError, () =>
				res
					.status(401)
					.render('authenticate/templates/login-form', { errors: true })
				)
			// last resort error handler
			.catch(next)
	}

	function handleDisplayLoginForm(req, res) {
		return res.render('authenticate/templates/login-form');
	}

	function handleLogOut(req, res) {
		req.session = null;
		res.redirect('/');
	}

	return {
		handleLoginAttempt,
		handleDisplayLoginForm,
		handleLogOut,
	}
}

function build({ messageStore, db }) {
	const queries = buildQueries({ db });
	const actions = buildActions({ queries, messageStore });
	const handlers = buildHandlers({ actions });

	const router = express.Router();

	router.route('/log-in')
		.get(handlers.handleDisplayLoginForm)
		.post(
			bodyParser.urlencoded({ extended: false }),
			handlers.handleLoginAttempt,
		);

	router.get('/log-out', handlers.handleLogOut);

	return { queries, handlers, actions, router };
}

module.exports = build;