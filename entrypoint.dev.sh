#!/bin/sh

echo "Running migrations in development environment..."

npm run db:migrate

echo "Starting application in development mode..."

exec npm run dev
