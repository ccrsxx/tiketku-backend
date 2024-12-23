# Tiketku Backend &middot; [![codecov](https://codecov.io/gh/ccrsxx/tiketku-backend/graph/badge.svg?token=v47qEryz4z)](https://codecov.io/gh/ccrsxx/tiketku-backend)

## Rest API Documentation

The API documentation can be found [here](https://postman.com/plane-ticket-be/workspace/team-workspace/collection/39975601-eb96ba17-3da2-4c9d-910e-598bb809f1a5) on Postman.

## Development

Here are the steps to run the project locally.

1. Clone the repository

   ```bash
   git clone https://github.com/ccrsxx/tiketku-backend.git
   ```

1. Change directory to the project

   ```bash
   cd tiketku-backend
   ```

1. Install dependencies

   ```bash
   npm i
   ```

1. Create a copy of the `.env.example` file and name it `.env.local`. Make sure to fill the credentials correctly.

   ```bash
   cp .env.example .env.local
   ```

1. Run migrations

   ```bash
   npm run db:migrate
   ```

1. Run the app

   ```bash
   npm run dev
   ```

1. Run tests

   ```bash
   npm run test
   ```

1. Optional. Run generate OpenAPI documentation. Make sure to fill necessary environment variables in `.env.local` file before running this command.

   ```bash
   npm run openapi:generate
   ```

1. Optional. You can run Prisma Studio to see the data in the database directly on the browser

   ```bash
   npm run db:studio
   ```
