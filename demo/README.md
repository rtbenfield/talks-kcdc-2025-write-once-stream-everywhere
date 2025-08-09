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

We'll be focusing on the behavior, architecture, and how to take advantage of Change Data Capture to build event-driven applications.
