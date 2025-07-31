FROM node:20-alpine AS builder

WORKDIR /app

# Copy all source files first to ensure npm has full context
COPY . .

# Install dependencies with the full project context
RUN npm install

# Build the application and export it as a static site
RUN npm run build

FROM nginx:alpine

# Remove the default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/

# Set the working directory to where nginx serves files from
WORKDIR /usr/share/nginx/html

# Clean out any default files
RUN rm -rf ./*

# Copy the static assets from the builder stage
# The 'npm run build' (with 'next export') command places files in the 'out' directory.
COPY --from=builder /app/out .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
