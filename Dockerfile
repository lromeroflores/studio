# 1. Base Image: Use the official Node.js image for the build stage.
FROM node:20-alpine AS base

# 2. Build Stage: Install dependencies and build the Next.js app.
FROM base AS builder
WORKDIR /app

# Install dependencies based on the lock file.
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy the rest of the application source code.
COPY . .

# Set build-time arguments for Genkit environment variables
ARG GOOGLE_API_KEY
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY}

# Build the Next.js application.
RUN npm run build

# 3. Production Stage: Create a smaller image for running the app.
FROM base AS runner
WORKDIR /app

# Set the environment to production.
ENV NODE_ENV=production

# Copy the built application from the builder stage.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on.
EXPOSE 3000

# The command to start the application.
CMD ["npm", "start"]
