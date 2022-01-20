const { v4: uuidv4 } = require('uuid');
const express = require('express');

function createActions({ messageStore }) {

	async function recordViewing(traceId, videoId, userId) {
		const viewedEvent = {
			id: uuidv4(),
			type: 'videoViewed',
			metadata: {
				traceId,
				userId,
			},
			data: {
				userId,
				videoId,
			}
		};
		const streamName = `viewing-${videoId}`;
		// TODO: add an expected version third parameter
		return messageStore.write(streamName, viewedEvent);
	}
	return {
		recordViewing,
	};
}

function createHandlers({ actions }) {

	function handleRecordViewing(req, res) {
		return actions
			.recordViewing(req.context.traceId, req.params.videoId)
			.then(() => res.redirect('/'));
	}
	return {
		handleRecordViewing,
	};
}

function createRecordViewings({ messageStore }) {
	const actions = createActions({ messageStore });
	const handlers = createHandlers({ actions });
	const router = express.Router();

	// router.route allows you to chain post, put, get ... etc handlers
	// instead of doing router.post, router.get ... etc separately
	router.route('/:videoId').post(handlers.handleRecordViewing);

	return { actions, handlers, router };
}

module.exports = createRecordViewings;