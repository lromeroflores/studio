# 1. Base Image: Use an official Node.js image.
# Use a specific version to ensure consistency.
FROM node:20-slim

# 2. Set Working Directory
WORKDIR /app

# 3. Install dependencies
# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install dependencies. Use --frozen-lockfile for reproducible builds.
RUN npm install --frozen-lockfile

# 4. Copy application files
# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# 5. Build the application
# Run the build script defined in your package.json
RUN npm run build

# 6. Expose the port the app runs on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000

# 7. Start the application
# The command to run your app (from package.json scripts)
CMD ["npm", "start"]
