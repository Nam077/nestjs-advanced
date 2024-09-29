
# NestJS Advanced

**nestjs-advanced** is a modern, full-stack backend framework designed to leverage the power of NestJS while integrating several essential tools and features for production-grade applications. It offers secure authentication mechanisms, background task processing, scalable caching, email functionality, and advanced logging for maintainability and performance.

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Dependencies Overview](#dependencies-overview)
- [Scripts](#scripts)
- [Technologies](#technologies)
- [Project Setup](#project-setup)
- [Testing](#testing)
- [Linting and Formatting](#linting-and-formatting)
- [Conventional Commits](#conventional-commits)
- [Jest Testing Configuration](#jest-testing-configuration)
- [License](#license)

## Introduction

The **nestjs-advanced** project provides a robust and scalable backend solution that incorporates a number of critical technologies:

- **Authentication using JWT with RSA encryption** for secure access control.
- **Session management** using Redis to support multiple user sessions.
- **Background job processing** with RabbitMQ.
- **Scheduled tasks** using cron jobs for recurring background processes.
- **Email sending** using Nodemailer with dynamic Pug templates.
- **API documentation** using Swagger for auto-generated API documentation.
- **Internationalization (i18n)** support for multi-language apps.
- **Comprehensive logging** with Winston and daily log rotation.

## Key Features

- **JWT Authentication** with RSA key pair encryption.
- **Redis for Caching & Session Management**: Fast in-memory storage for managing user sessions and other cacheable data.
- **RabbitMQ for Message Queuing**: Handles asynchronous task processing, such as sending emails and processing jobs in the background.
- **Scheduled Cron Jobs**: Automated and recurring tasks using the `@nestjs/schedule` module.
- **Email System**: Integrated with Nodemailer and Pug for dynamic email templates, allowing flexible email functionality (e.g., verification, password resets).
- **API Documentation**: Swagger integration for interactive API documentation and exploration.
- **Fastify**: A high-performance alternative to Express.js for handling HTTP requests.
- **Winston Logging**: Custom logging setup with daily file rotation using `winston-daily-rotate-file`.

## Dependencies Overview

This project includes a wide variety of dependencies, both runtime and development, to enable seamless operations, security, and development productivity:

### Runtime Dependencies

- **@nestjs/common**: Provides core NestJS functionality.
- **@nestjs/config**: Handles environment-based configurations.
- **@nestjs/core**: The core NestJS module.
- **@nestjs/jwt**: Used for generating and verifying JWTs.
- **@nestjs/platform-fastify**: Fastify adapter for NestJS for improved performance.
- **@nestjs/typeorm**: TypeORM integration with NestJS for database management.
- **ioredis**: Redis client for NestJS.
- **nest-winston**: Integration with Winston for advanced logging.
- **bcryptjs**: Password hashing and validation.
- **crypto-js**: For cryptographic operations like encryption and hashing.
- **winston-daily-rotate-file**: Log rotation integration for daily logs.
- **nodemailer**: For sending emails.
- **pg**: PostgreSQL client for connecting to the database.
- **@golevelup/nestjs-rabbitmq**: RabbitMQ integration for NestJS.
- **pug**: Template engine for rendering dynamic emails.

### Development Dependencies

- **ESLint & Prettier**: Ensures code quality and consistent formatting.
- **Commitlint**: Enforces conventional commit messages.
- **Husky**: Git hooks for automated pre-commit tasks like linting and testing.
- **Jest**: Testing framework.
- **TypeScript**: Type safety and transpilation.
- **Supertest**: For end-to-end testing of the API.

## Scripts

This project contains several yarn scripts to streamline development, testing, and deployment tasks:

- **typeorm**: Runs TypeORM CLI commands.
- **migration:generate**: Generates a new migration file based on your changes in entities.
- **migration:create**: Creates a new empty migration file.
- **migration:run**: Runs the pending database migrations.
- **migration:revert**: Reverts the latest migration that was run.
- **schema:drop**: Drops the entire database schema.
- **build**: Builds the NestJS application for production.
- **format**: Formats the codebase using Prettier.
- **start**: Starts the application in production mode.
- **start:dev**: Starts the application in development mode with live reload.
- **start:debug**: Starts the application in debug mode with live reload.
- **start:prod**: Starts the application in production mode.
- **lint**: Runs ESLint to check for code issues and automatically fixes them.
- **test**: Runs all unit tests with Jest.
- **test:watch**: Runs tests continuously in watch mode.
- **test:cov**: Runs the tests and generates a coverage report.
- **test:debug**: Runs the tests with debugging enabled.
- **test:e2e**: Runs end-to-end tests using Jest and Supertest.
- **prepare**: Prepares Husky hooks for Git pre-commit and pre-push operations.
- **commit**: Uses Commitizen to help with conventional commit message formatting.

## Technologies

Here’s a list of key technologies and libraries used in the project:

- **NestJS**: The core framework for building scalable server-side applications.
- **Fastify**: High-performance web framework for handling HTTP requests.
- **TypeORM**: Object-relational mapper for PostgreSQL integration.
- **Redis**: In-memory store used for session and cache management.
- **RabbitMQ**: Message broker for background job processing.
- **Nodemailer**: For sending emails with dynamic templates.
- **Winston**: Provides structured logging with daily file rotation.
- **Class-validator**: Validation framework for ensuring data integrity in DTOs.
- **Swagger**: Automatically generates API documentation.

## Project Setup

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Nam077/nestjs-advanced.git
   cd nestjs-advanced
   ```

2. Install the dependencies:

   ```bash
   yarn install
   ```

3. Copy the example environment configuration file:

   ```bash
   cp .env.example .env
   ```

4. Start the services using Docker:

   ```bash
   docker-compose --env-file .env.docker up --build
   ```

5. Run database migrations:

   ```bash
   yarn run migration:run
   ```

### Running the Application

- Start in development mode with live reload:

  ```bash
  yarn run start:dev
  ```

- Build and run in production:

  ```bash
  yarn run build
  yarn run start:prod
  ```

## Testing

The project includes comprehensive test coverage with unit tests and end-to-end (E2E) tests.

### Running Tests

- To run all tests:

  ```bash
  yarn run test
  ```

- To run tests in watch mode:

  ```bash
  yarn run test:watch
  ```

- To generate a coverage report:

  ```bash
  yarn run test:cov
  ```

## Linting and Formatting

The project follows strict code quality standards using **ESLint** and **Prettier**. To run lint checks and auto-fix issues:

```bash
yarn run lint
```

To format the code using Prettier:

```bash
yarn run format
```

### Commitlint and Husky

This project uses **Husky** to run Git hooks for pre-commit and pre-push tasks like linting and testing. **Commitlint** enforces conventional commit messages, helping to maintain a clean and consistent Git history.

To make a commit:

```bash
yarn run commit
```

This will prompt you to use Commitizen, which helps format your commit message according to conventional commit standards (e.g., `feat: add user authentication`).

## Jest Testing Configuration

The project is configured to use **Jest** for testing. Here's the Jest configuration included in the project:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\.spec\.ts$",
  "transform": {
    "^.+\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

This configuration enables test coverage collection, TypeScript support, and running tests in a Node.js environment.

## License

This project is licensed under the **UNLICENSED** license. This means that the project source code cannot be freely used, copied, modified, or distributed by others without explicit permission from the author.

