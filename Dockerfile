# Use Node.js 20 LTS
FROM node:20-alpine

# Install bash and other dependencies
RUN apk add --no-cache bash postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5000

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]
