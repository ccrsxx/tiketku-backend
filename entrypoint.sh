#!/bin/sh

if [ "$DEPLOY_DATABASE" = "true" ]; then
    echo "Running database migration..."

    until npm run db:deploy; do
        echo "Migration failed. Retrying in 5 seconds..."
        sleep 5
    done
fi

echo "Starting application in production mode..."

exec npm run start:docker
