# Build stage
FROM node:20-alpine AS build

# Create and change to the app directory
WORKDIR /app

# Copy application dependency manifests to the container image
COPY package*.json .

# Install dependencies
RUN npm ci

# Copy local code to the container image
COPY . .

# Build the application
RUN --mount=type=secret,id=direct_url \
    --mount=type=secret,id=database_url \
    DIRECT_URL=$(cat /run/secrets/direct_url) \
    DATABASE_URL=$(cat /run/secrets/database_url) \
    npm run build

# ---

# Production stage
FROM node:20-alpine AS production

# Add environment variables
ENV HUSKY=0

# Create and change to the app directory
WORKDIR /app

# Copy application dependency manifests to the container image
COPY package*.json .

# Install dependencies
RUN npm ci --omit=dev

# Copy the entrypoint script
COPY entrypoint.sh .

# Copy the prisma schema and migrations
COPY src/utils/prisma src/utils/prisma

# Copy the generated prisma client
COPY --from=build /app/node_modules/.prisma node_modules/.prisma

# Copy the build output to the production image
COPY --from=build /app/build .

# Run the web service on container startup
ENTRYPOINT ["./entrypoint.sh"]

# Expose port for documentation, but this can be overriden if env variable PORT is set
EXPOSE 4000
