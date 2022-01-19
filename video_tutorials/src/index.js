const createExpressApp = require('./app/express');
const createConfig = require('./config');
const env = require('./env');

const config = createConfig({ env });
const app = createExpressApp({ config, env });

function start() {
	// start the polling for aggregators and components into the message store
	// these autonomous units are eventually consistent
	// consistency is the name of the game in microservices
	config.aggregators.forEach(aggr => aggr.start());
	config.components.forEach(comp => comp.start());
	app.listen(env.port, signalAppStart);
}

function signalAppStart() {
	console.log(`${env.appName} started`);
	console.table([['Port', env.port], ['Environment', env.env]]);
}

module.exports = {
	app,
	config,
	start,
};