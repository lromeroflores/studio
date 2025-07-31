# ==================================================================================== #
# HELPERS
# ==================================================================================== #

# Nombre de la imagen de Docker. Debe coincidir con el nombre en chart/values.yaml.
IMAGE_NAME   = contract-ease
IMAGE_TAG    ?= latest
CONTAINER_NAME = $(IMAGE_NAME)-dev

.PHONY: help
help: ## Muestra este mensaje de ayuda
	@echo "Uso: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==================================================================================== #
# DEVELOPMENT
# ==================================================================================== #

.PHONY: install
install: ## Instala las dependencias del proyecto
	npm install

.PHONY: dev
dev: ## Ejecuta el servidor de desarrollo local de Next.js
	npm run dev

.PHONY: lint
lint: ## Revisa el código en busca de problemas de estilo
	npm run lint

.PHONY: format
format: ## Formatea el código con Prettier
	npm run format

.PHONY: test
test: ## Ejecuta las pruebas unitarias
	npm run test

# ==================================================================================== #
# DOCKER BUILDS
# ==================================================================================== #

.PHONY: docker-build
docker-build: ## Construye la imagen de Docker para producción
	@echo "🏗️ Construyendo la imagen de Docker: $(IMAGE_NAME):$(IMAGE_TAG)..."
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

.PHONY: docker-run
docker-run: ## Ejecuta la aplicación dentro de un contenedor Docker
	@echo "🚀 Iniciando el contenedor '$(CONTAINER_NAME)'..."
	@echo "✅ Accede a la aplicación en http://localhost:8080"
	docker run --rm -d --name $(IMAGE_NAME)$(CONTAINER_NAME) -p 8080:8080 $(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: docker-stop
docker-stop: ## Detiene el contenedor Docker en ejecución
	@echo "🛑 Deteniendo el contenedor '$(IMAGE_NAME)$(CONTAINER_NAME)'..."
	docker stop $(IMAGE_NAME)$(CONTAINER_NAME)

# ==================================================================================== #
# CLEANING
# ==================================================================================== #

.PHONY: clean
clean: ## Elimina los artefactos de construcción y las dependencias instaladas
	@echo "🧹 Limpiando..."
	rm -rf out
	rm -rf .next
	rm -rf node_modules
	rm -rf coverage
	rm -f .DS_Store

.PHONY: full-clean
full-clean: clean ## Limpia todo, incluida la imagen de Docker
	@echo "🧼 Eliminando la imagen de Docker $(IMAGE_NAME):$(IMAGE_TAG)..."
	-docker rmi $(IMAGE_NAME):$(IMAGE_TAG)
