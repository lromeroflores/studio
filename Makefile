
# Makefile for ContractEase App

# ==============================================================================
# Variables
# ==============================================================================

# Get Project ID from gcloud config, or use a placeholder
PROJECT_ID ?= $(shell gcloud config get-value project 2>/dev/null)
ifeq ($(PROJECT_ID),)
  PROJECT_ID = "your-gcp-project-id"
endif

# Service and image names
SERVICE_NAME = contract-ease-app
REGION = us-central1
IMAGE_NAME = covalto-ai-services/$(SERVICE_NAME)
IMAGE_TAG ?= $(shell git rev-parse --short HEAD)
REGISTRY_URL = $(REGION)-docker.pkg.dev
IMAGE_URL = $(REGISTRY_URL)/$(PROJECT_ID)/$(IMAGE_NAME):$(IMAGE_TAG)

# Default environment for deployment
ENV ?= dev

# ==============================================================================
# Docker & Build Targets
# ==============================================================================

.PHONY: build
build:
	@echo "Building Docker image: $(IMAGE_URL)"
	@docker build -t $(IMAGE_URL) .

.PHONY: push
push: build
	@echo "Pushing Docker image to Artifact Registry: $(IMAGE_URL)"
	@gcloud auth configure-docker $(REGISTRY_URL)
	@docker push $(IMAGE_URL)

# ==============================================================================
# Local Development Targets
# ==============================================================================

.PHONY: dev
dev:
	@echo "Starting Next.js and Genkit development servers..."
	@echo "Run 'make dev-next' and 'make dev-genkit' in separate terminals."

.PHONY: dev-next
dev-next:
	@echo "Starting Next.js frontend on http://localhost:3000"
	npm run dev

.PHONY: dev-genkit
dev-genkit:
	@echo "Starting Genkit AI flows..."
	npm run genkit:watch

.PHONY: run-local
run-local:
	@echo "Running the app locally using Docker on port 3000..."
	@docker run --rm -it -p 3000:3000 -e GOOGLE_API_KEY=$(shell grep GOOGLE_API_KEY .env | cut -d '=' -f2) $(IMAGE_URL)

# ==============================================================================
# Deployment Targets (Example for Cloud Run)
# ==============================================================================

.PHONY: deploy
deploy: push
	@echo "Deploying image to Cloud Run in environment: $(ENV)..."
	gcloud run deploy $(SERVICE_NAME)-$(ENV) \
		--image=$(IMAGE_URL) \
		--region=$(REGION) \
		--platform=managed \
		--allow-unauthenticated \
		--update-secrets=GOOGLE_API_KEY=google-api-key:latest \
		--memory=1Gi \
		--min-instances=0 \
		--max-instances=3 \
		--update-labels=environment=$(ENV)

# ==============================================================================
# Quality & Maintenance Targets
# ==============================================================================

.PHONY: lint
lint:
	@echo "Running linter..."
	npm run lint

.PHONY: lint-fix
lint-fix:
	@echo "Fixing lint issues..."
	npm run lint:fix

.PHONY: format
format:
	@echo "Formatting code with Prettier..."
	npm run format

.PHONY: clean
clean:
	@echo "Cleaning up local Docker images..."
	@docker images -q $(IMAGE_URL_BASE) | xargs -r docker rmi

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build         Build the Docker image."
	@echo "  make push          Push the Docker image to Artifact Registry."
	@echo "  make dev           Show instructions to run dev servers."
	@echo "  make dev-next      Run the Next.js frontend."
	@echo "  make dev-genkit    Run the Genkit AI flows."
	@echo "  make run-local     Run the app locally in a Docker container."
	@echo "  make deploy        Deploy to Cloud Run (specify ENV, e.g., 'make deploy ENV=staging')."
	@echo "  make lint          Run the linter."
	@echo "  make lint-fix      Attempt to fix lint issues automatically."
	@echo "  make format        Format the codebase with Prettier."
	@echo "  make clean         Remove local Docker images for this project."
