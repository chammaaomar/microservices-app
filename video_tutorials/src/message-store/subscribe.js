const Bluebird = require('bluebird');
const { v4: uuidv4 } = require('uuid');

function configureCreateSubscription({ read, readLastMessage, write }) {
	return ({
		streamName,
		handlers,
		subscriberId,
		// maximum number of messages to fetch from stream in one batch
		messagesPerTick = 100,
		// messages processed before committing position to position stream
		positionUpdateInterval = 100,
		// how frequently to poll
		tickIntervalMs = 100
	}) => {
		// a single component may subscribe to multiple streams, and thus needs a globally
		// unique subscriberId PER subscription
		const subscriberStreamName = `subscriberPosition-${subscriberId}`;

		
		let currentPosition = 0;
		let messagesSinceLastPositionWrite = 0;
		let keepGoing = true;

		function start() {
			console.log(`Started ${subscriberId}`);
			return poll();
		}

		function stop() {
			console.log(`Stopped ${subscriberId}`);
			keepGoing = false;
		}

		async function poll() {
			await loadPosition();

			while (keepGoing) {
				const messagesProcessed = await tick();
				if (messagesProcessed === 0) {
					await Bluebird.delay(tickIntervalMs);
				}
			}
		}

		function tick() {
			return getNextBatchOfMessages()
				.then(processBatch)
				.catch(err => {
					console.error('Error processing batch', err);
					stop();
				})
		}

		// loadPosition is a performance optimization, not a correctness requirement
		// it's OK if we read from the beginning of the stream, since all the handlers
		// should be idempotent, however it would be a waste of time
		function loadPosition() {
			return readLastMessage(subscriberStreamName)
				.then(message => {
					currentPosition = message ? message.data.position : 0;
				});
		}

		function writePosition(position) {
			const positionEvent = {
				id: uuidv4(),
				type: 'Read',
				data: { position },
			}
			// TODO: need to implement optimistic concurrency control
			return write(subscriberStreamName, positionEvent);
		}

		function updateReadPosition(position) {
			currentPosition = position;
			messagesSinceLastPositionWrite++;

			if (messagesSinceLastPositionWrite == positionUpdateInterval) {
				messagesSinceLastPositionWrite = 0;
				return writePosition(position);
			}

			return Bluebird.resolve(true);
		}

		function getNextBatchOfMessages() {
			return read(streamName, currentPosition + 1, messagesPerTick);
		}
		
		// $any is a valid JS identifier
		// if no handler for that type of event, simply return true
		function handleMessage(message) {
			const handler = handlers[message.type] || handlers.$any;
			return handler ? handler(message) : Promise.resolve(true);
		}

		function logError (lastMessage, error) {
			console.error(
			  'error processing:\n',
			  `\t${subscriberId}\n`,
			  `\t${lastMessage.id}\n`,
			  `\t${error}\n`
			)
		  }

		function processBatch(messages) {
			return Bluebird.each(messages, message => 
				handleMessage(message)
				.then(() => updateReadPosition(message.globalPosition))
				.catch(err => {
					logError(message, err);
					throw err;
				})
				.then(() => messages.length));
		}

		return {
			loadPosition,
			start,
			stop,
			tick,
			writePosition,
		}
	}
}

module.exports = configureCreateSubscription;