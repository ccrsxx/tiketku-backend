#!/bin/sh

if [ "$DEPLOY_DATABASE" = "true" ]; then
    echo "Running database migration..."

    npm run db:deploy
fi

echo "Starting application in production mode..."

exec npm run start:docker
