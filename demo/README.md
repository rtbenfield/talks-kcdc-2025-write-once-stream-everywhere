# Write Once: Stream Everywhere

This example app is meant to accompany the talk _Write Once: Stream Everywhere: Transforming Your Data Into Events_ at KCDC 2025.

The app is a simple e-commerce example that demonstrates the value of event-driven architecture using Change Data Capture. It's built with TypeScript, React Router 7, Postgres, and Debezium. Most of the code was completed by our robotic friends.

The app contains a Docker Compose configuration for starting a local Postgres database and Debezium server. If you're not using Docker, you can substitute these containers with your own instances.

## Getting Started

### Prerequisites

- Node.js v22
- pnpm v10
- Docker

### Setup

Install the dependencies:

```bash
pnpm install
```

Start the accompanying Postgres and Debezium containers:

```bash
docker compose up -d
```

Seed the database:

```bash
pnpm run db:seed
```

### Development

Start the React Router development server:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

If you used the Docker Compose file, your Postgres database will be available at `localhost:5432`. Debezium will be connected to the Postgres database and will stream changes to the application.

## Exercise Concepts

There are three tags used as comments in the code to navigate the exercise.

- `REVIEW` denotes setup code that we'll stop to explain before getting to the details.
- `FIXME` denotes code that can be problematic. We're going to fix that!
- `TODO` denotes larger steps to move through the exercise, such as enabling side effects or Debezium event handling.

Each of these tags is followed by a number that indicates the order in which to complete them. I'll be using the [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) extension during the demo to navigate this way.

### Focus Areas

This isn't a React Router demo. We're not going to focus on the UI, routing, form handling, or any of that.

We'll be focusing on the behavior, architecture, and how to take advantage of Change Data Capture to build event-driven applications. These are primarily modeled through side effects.

#### Side Effects

E-commerce apps are often full of side effects, which makes them a great example for event-driven architecture. Customer emails, order processing, inventory changes, and more all are side effects in an e-commerce app. Many of them are accompanied with changes in data, such as an item being added to a cart or an order being confirmed.

This demo has a few notable side effects we'll be improving with Change Data Capture. None of these are implemented in full, but are placeholders for services you might interact with in a real app.

- When a user adds an item to their cart we'll schedule an abandoned cart email.
- When a user checks out, we'll cancel their abandoned cart email.
- When an order is placed, we'll send the user an order confirmation.
- When an order is placed, we'll process the order fulfillment.

## Oversimplification

This example is oversimplified for the sake of the demo. Debezium is reporting events directly to an endpoint in the web app, which is not the most scalable or reliable solution in production. Consider expanding this example to include a message queue or event bus to decouple the web app, improving Debezium's throughput and the durability of the events.
