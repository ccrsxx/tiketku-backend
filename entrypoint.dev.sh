#!/bin/sh

echo "Running migrations in development environment..."

until npm run db:migrate; do
    echo "Migration failed. Retrying in 5 seconds..."
    sleep 5
done

echo "Seeding database in development environment..."

until npm run db:seed; do
    echo "Seeding failed. Retrying in 5 seconds..."
    sleep 5
done

echo "Starting application in development mode..."

exec npm run dev
