# Build Production image
FROM node:16.20.0-alpine

# Set current working directory
WORKDIR /app

# Copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json package-lock.json ./

# Install project dependencies
RUN npm install --force

# Copy project files and folders to the working directory
COPY . /app

# Expose application on port 5010
EXPOSE 8080

# Start up command for the application
CMD [ "node", "app.js" ]
