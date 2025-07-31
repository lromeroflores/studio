# ==============================================================================
# Makefile para ContractEase
#
# Este archivo proporciona comandos para automatizar tareas comunes como
# la construcción, ejecución y despliegue de la aplicación.
# ==============================================================================

# Variables
# ------------------------------------------------------------------------------
# Nombre del proyecto (usado para nombrar la imagen de Docker).
PROJECT_NAME ?= contract-ease
# Etiqueta de la imagen de Docker para compilaciones locales.
TAG_LOCAL    ?= latest
# Repositorio de Docker en Artifact Registry.
DOCKER_REPO  ?= us-central1-docker.pkg.dev/covalto-registry-spt/covalto-ai-services/$(PROJECT_NAME)
# Etiqueta de la imagen para despliegues (CircleCI la sobreescribirá).
TAG          ?= $(shell git rev-parse --short HEAD)

# Colores para la salida
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

## --------------------------------------
## Comandos de Desarrollo Local
## --------------------------------------

.PHONY: dev-next
dev-next: ## (Dev) Ejecuta el servidor de desarrollo de Next.js.
	@echo "$(GREEN)▶️ Iniciando el servidor de desarrollo de Next.js en http://localhost:3000...$(RESET)"
	@npm run dev

.PHONY: dev-genkit
dev-genkit: ## (Dev) Ejecuta el servidor de desarrollo de Genkit (IA).
	@echo "$(GREEN)▶️ Iniciando el servidor de Genkit AI en modo watch...$(RESET)"
	@npm run genkit:watch

## --------------------------------------
## Comandos de Docker
## --------------------------------------

.PHONY: build
build: ## (Docker) Construye la imagen de Docker localmente.
	@echo "$(GREEN)🏗️ Construyendo la imagen de Docker: $(DOCKER_REPO):$(TAG_LOCAL)...$(RESET)"
	@docker build -t $(DOCKER_REPO):$(TAG_LOCAL) .

.PHONY: push
push: ## (Docker) Sube la imagen de Docker a Artifact Registry.
	@echo "$(GREEN)⬆️ Subiendo la imagen $(DOCKER_REPO):$(TAG_LOCAL) a Artifact Registry...$(RESET)"
	@docker push $(DOCKER_REPO):$(TAG_LOCAL)

.PHONY: run-local
run-local: ## (Docker) Ejecuta la aplicación en un contenedor Docker local.
	@echo "$(GREEN)🚀 Ejecutando la aplicación en un contenedor Docker en http://localhost:3000...$(RESET)"
	@docker run --rm -p 3000:8080 --env-file .env $(DOCKER_REPO):$(TAG_LOCAL)

.PHONY: clean
clean: ## (Docker) Elimina la imagen de Docker construida localmente.
	@echo "$(YELLOW)🧹 Eliminando la imagen de Docker local: $(DOCKER_REPO):$(TAG_LOCAL)...$(RESET)"
	@docker rmi $(DOCKER_REPO):$(TAG_LOCAL) || echo "La imagen no existía, no se necesita limpieza."

## --------------------------------------
## Comandos de Calidad de Código
## --------------------------------------

.PHONY: lint
lint: ## (QA) Ejecuta el linter (ESLint).
	@echo "$(GREEN)🔎 Ejecutando el linter...$(RESET)"
	@npm run lint

.PHONY: lint-fix
lint-fix: ## (QA) Intenta corregir automáticamente los problemas de linting.
	@echo "$(GREEN)🛠️ Intentando corregir problemas de linting...$(RESET)"
	@npm run lint:fix

.PHONY: format
format: ## (QA) Formatea el código con Prettier.
	@echo "$(GREEN)💅 Formateando el código con Prettier...$(RESET)"
	@npm run format

## --------------------------------------
## Comandos de Despliegue (Ejemplo)
## --------------------------------------

.PHONY: deploy
deploy: ## (Deploy) Despliega la aplicación en un entorno (ej: dev, stg, prod).
	@echo "$(YELLOW)🚀 Desplegando la aplicación en el entorno: $(ENV)...$(RESET)"
	@echo "Este es un comando de ejemplo. El despliegue real es manejado por CircleCI y Argo CD."
	# Aquí irían los comandos de Helm/kubectl si se hiciera manualmente.

## --------------------------------------
## Ayuda
## --------------------------------------

.PHONY: help
help: ## Muestra esta ayuda.
	@echo ''
	@echo ' Búsqueda de blancos:'
	@echo ''
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ''

.DEFAULT_GOAL := help

    