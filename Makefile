# ==============================================================================
# Makefile for ContractEase Next.js Application
#
# This Makefile provides a convenient way to manage common development and
# deployment tasks.
# ==============================================================================

# Get the short Git commit hash
GIT_SHORT_SHA := $(shell git rev-parse --short HEAD)
# Docker image name configuration
IMAGE_NAME = us-central1-docker.pkg.dev/covalto-registry-spt/covalto-ai-services/contract-ease

# Set default goal
.DEFAULT_GOAL := help

# Phony targets to avoid conflicts with file names
.PHONY: help build push run-local dev-next dev-genkit deploy lint format clean

# Help command to display available targets
help:
	@echo "----------------------------------------------------"
	@echo "  Makefile for ContractEase"
	@echo "----------------------------------------------------"
	@echo "Available commands:"
	@echo "  build          - Build the Docker image for the application."
	@echo "  push           - Push the Docker image to Artifact Registry."
	@echo "  run-local      - Run the application locally in a Docker container."
	@echo "  dev-next       - Start the Next.js frontend development server."
	@echo "  dev-genkit     - Start the Genkit AI flows development server."
	@echo "  deploy         - Deploy the application (example for Cloud Run, can be adapted)."
	@echo "  lint           - Run the linter to check for code quality issues."
	@echo "  lint-fix       - Automatically fix linting issues."
	@echo "  format         - Format the codebase using Prettier."
	@echo "  clean          - Remove local Docker images created for this project."
	@echo "----------------------------------------------------"


# Build the Docker image
build:
	@echo "Building Docker image with tag: $(GIT_SHORT_SHA)"
	docker build -t $(IMAGE_NAME):$(GIT_SHORT_SHA) .

# Push the Docker image to Artifact Registry
push:
	@echo "Pushing Docker image $(IMAGE_NAME):$(GIT_SHORT_SHA) to Artifact Registry..."
	@echo "Make sure you have authenticated with 'gcloud auth configure-docker us-central1-docker.pkg.dev'"
	docker push $(IMAGE_NAME):$(GIT_SHORT_SHA)

# Run the application locally in a Docker container
run-local:
	@echo "Running application in a local Docker container..."
	@echo "Mapping container port 8080 to host port 3000."
	@echo "Using environment variables from .env file."
	docker run --rm -p 3000:8080 --env-file .env $(IMAGE_NAME):$(GIT_SHORT_SHA)

# Start the Next.js development server
dev-next:
	@echo "Starting Next.js development server..."
	npm run dev

# Start the Genkit development server
dev-genkit:
	@echo "Starting Genkit AI flows development server..."
	npm run genkit:watch

# Deploy the application
deploy:
	@echo "Deploying is handled by the CircleCI pipeline via Argo CD."
	@echo "This is a placeholder for manual deployment if needed."

# Run the linter
lint:
	@echo "Running linter..."
	npm run lint

# Fix linting issues automatically
lint-fix:
	@echo "Fixing linting issues..."
	npm run lint:fix

# Format the code
format:
	@echo "Formatting code with Prettier..."
	npm run format

# Clean up local Docker images
clean:
	@echo "Removing local Docker images for this project..."
	@docker images -q $(IMAGE_NAME) | xargs -r docker rmi
