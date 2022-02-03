# Video Tutorials

This repo is an implementation of the project discussed in the Paragmatic Programmers book [Practical Microservices](https://pragprog.com/titles/egmicro/practical-microservices/). It's a `barebones` Video Tutorials app, but it's primarily meant as a demonstration of a microservices architecture. The `mvc` folder houses a barebones Model-View-Controller (MVC) implementation.

## Microservice Architecture

The various ingredients of this implementation of the microservice architecture are
### Applications
Stateless handlers of user requests. These emit events and commands to the message store.
### Message Store
A durable, persistent database, laid out as a collection of append-only streams, each owned (can be exclusively appended to) by a component. This is the source of truth on all events in the system, and these events source state. So in case of loss of state in the View Data (discussed below), state can be completely reconstructed from the events in the Message Store. This is structured as append-only streams, so it's optimized for writing.
### Components
These are the autonomous idempotent doers of things in the system. They get commands to do things from the message stream, and upon completing the command successfully or unsuccessfully, they write an event to the message stream(s) they own. They are autonomous as they don't need to reach out to other components to do their job, and idempotent as we can't guarantee exactly-once delivery of messages.
### Aggregators
The message stream doesn't contain user-friendly state. Instead, it contains logs of events. These events represent state transitions or state diffs, and are a log of everything that's happened in our system. Aggregators aggregate or shape these logs of state transitions into various user-friendly states. For example, if the events in the message store are 'Debited' and 'Credited' events in a financial system, an aggregator can aggregate these events to get a net balance for the user account.
### View Data
This represents the state that the applications can query. It's written to exclusively by aggregators, and represents a state derived from the events log in the message store. It's derived and is not a source of truth. It's optimized for reading.