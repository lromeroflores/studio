# 1. Base Image - Use the Covalto/Credijusto standard Node.js image
FROM us-central1-docker.pkg.dev/covalto-registry-spt/platform-base-images/nodejs:20.12.0-alpine as base

# 2. Build Stage
FROM base AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# 3. Production Stage
FROM base AS production
WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]
