# Video Tutorials

This repo is an implementation of the project discussed in the Paragmatic Programmers book [Practical Microservices](https://pragprog.com/titles/egmicro/practical-microservices/). It's a barebones Video Tutorials app, but it's primarily meant as a demonstration of a microservices architecture. The `mvc` folder houses a barebones Model-View-Controller (MVC) implementation. The implementation uses:

- Node.js as the language
- Express to create the applications to handle user requests
- PostgreSQL for the Message Store and the View Data
- Docker Compose to spin up the PostgreSQL databases

## Microservice Architecture

<img width="1217" alt="microservice_arch" src="https://user-images.githubusercontent.com/26146373/152267367-8fdf5205-dc5a-4011-a3e3-50492514daac.png">

The various ingredients of this implementation of the microservice architecture are
### Applications
Stateless handlers of user requests. These emit events and commands to the message store.
### Message Store
A durable, persistent database, laid out as a collection of append-only streams, each owned (can be exclusively appended to) by a component. This is the source of truth on all events in the system, and these events source state. So in case of loss of state in the View Data (discussed below), state can be completely reconstructed from the events in the Message Store. This is structured as append-only streams, so it's optimized for writing.

What do we get by persisting state transitions instead of just persisting state? We get a lot of darn flexibility. Consider
the following: instead of just persisting the total number of views a video has gotten, we can persist each event of the video
being viewed, `VideoViewed` events. This means that we can capture these events and run them through a fraud detection
algorithm. We can create an analytics component that creators can use to view trends ... _etc_. We get much flexibility by
thinking of "Video Viewing" as a distinct business concern in our system.
### Components
These are the autonomous _idempotent_ doers of things in the system. They get commands to do things from the message stream,
and upon completing the command successfully or unsuccessfully, they write an event to the message stream(s) they own. They
are autonomous as they don't need to reach out to other components to do their job, and idempotent as we can't guarantee
exactly-once delivery of commands.
### Aggregators
The message stream doesn't contain user-friendly state. Instead, it contains logs of events. These events represent state transitions or state diffs, and are a log of everything that's happened in our system. Aggregators aggregate or shape these logs of state transitions into various user-friendly states. For example, if the events in the message store are 'Debited' and 'Credited' events in a financial system, an aggregator can aggregate these events to get a net balance for the user account.
### View Data
This represents the state that the applications can query. It's written to exclusively by aggregators, and represents a state derived from the events log in the message store. It's derived and is not a source of truth. It's optimized for reading.

### CQRS
This is an acronym for Command-Query-Responsibility-Segregation, and it's reflected in our architecture by the fact that
commands are issued to the message store and picked up by components, and queries are made to the View Data, which is an
architecturally distinct piece from the message store. 

### Message flow
Note the unidirectional flow of messages in the architecture:
- Applications write to the message store
- Components read commands from the message store and write events to the message store
- Aggregators read events from the message store
- Aggregators use events from the message store to source state in the View Data
- Applications can read state from the View Data to present it to the user

An important feature of this microservice architecture is that all communication between applications and components,
and components among themselves is done through explicit APIs and contracts. Each component declares the commands it handles
and the events it writes. There is no implicit 'backdoor' communication by changing database rows. All communication is
explicit and 'front door'. If your microservices communicate implicitly by reading rows modified by other microservices,
you have tight coupling which hinders development velocity. You no longer can change a microservice without worrying about
breaking other microservices! 

## A Common Misinterpretation of The Microservice Architecture
A misinterpretation of a microservice architecture that I had was the following:
Suppose in our Video Tutorials system we have Videos and Users MVC models with tables of the same names, like the following:
<img width="666" alt="mvc" src="https://user-images.githubusercontent.com/26146373/152269928-8bdbead3-f364-414b-bcdb-31f7da0fb7c4.png">

We decide we want to extract microservices to get the extolled virtues of such an architecture: reliability, development
velocity ... _etc_. So we extract a Videos "microservice" and a "Users" microservice:

<img width="671" alt="distributed_mvc" src="https://user-images.githubusercontent.com/26146373/152269980-0434cf89-d7d9-48b1-8263-a97b4d85937c.png">

So what has happened? What have we gained?
- JOIN statements that were executed in the DB are now executed in the application
- We replaced local function calls with unreliable HTTP calls
- Increased operational complexity and cost. We now need more complex tooling to even run on our development machines
- A "user" doesn't represent a single, isolated business concern. Instead, it's a central entity that touches all aspects
of our system, so if it's going down, it's bringing down the "Videos" microservice with it. Our "microservices" are chatty
and not truly independent business concerns.
- One single point of failure has becomes two single points of failure

We gained a distributed monolith. The worst of both worlds. It's because the architecture and data model are fundamentally
the same, we just made it distributed. To truly and beneficially extract microservices we have to identify independent business
concerns and construct corresponding components, so each component can complete its job without consulting other components
and they all communicate asynchronously in a decoupled fashion through an intermediary (message store in our architecture).
Decoupled communication ensures that if one component is down, other components just continue writing to the message store,
and once its back up, it reads the messages it had waiting for it, and carries out its tasks, so no user state or interactions
are lost. 
