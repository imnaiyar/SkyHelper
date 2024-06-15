# Base image
FROM node:20

# Set the working directory in the container
WORKDIR /root/skyhelper

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install only production dependencies
RUN npm ci

# Bundle rest of the source code
COPY . .

# Expose port 8080 for dashboard
EXPOSE 5000

# Define the command to run your Node.js application
CMD [ "npm", "start" ]