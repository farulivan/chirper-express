# Use an official Node runtime as a parent image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy the rest of your application's code
COPY . .

# Set environment variable to production
ENV NODE_ENV=production

# Expose port 3000 to the outside once the container is launched
EXPOSE 3000

# Run the application
CMD ["node", "src/index.js"]
