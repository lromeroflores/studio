# Makefile para ContractEase - App de Next.js

# Variables
IMAGE_NAME   = contract-ease
IMAGE_TAG    ?= latest
CONTAINER_NAME = contract-ease-dev

# ====================================================================================
# Ayuda
# ====================================================================================

.PHONY: help
help: ## Muestra este mensaje de ayuda
	@echo "Uso: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ====================================================================================
# Desarrollo Local
# ====================================================================================

.PHONY: install
install: ## Instala las dependencias del proyecto con npm
	npm install

.PHONY: dev
dev: ## Ejecuta el servidor de desarrollo local de Next.js
	npm run dev

.PHONY: dev-genkit
dev-genkit: ## Ejecuta los flujos de IA de Genkit en modo de desarrollo
	npm run genkit:watch

.PHONY: lint
lint: ## Ejecuta el linter para revisar el estilo del código
	npm run lint

.PHONY: format
format: ## Formatea el código con Prettier
	npm run format

.PHONY: test
test: ## Ejecuta las pruebas (actualmente no hay)
	npm run test

# ====================================================================================
# Comandos de Docker
# ====================================================================================

.PHONY: docker-build
docker-build: ## Construye la imagen de Docker para producción
	@echo "🏗️ Construyendo la imagen de Docker: $(IMAGE_NAME):$(IMAGE_TAG)..."
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

.PHONY: docker-run
docker-run: ## Ejecuta la aplicación dentro de un contenedor Docker
	@echo "🚀 Iniciando el contenedor '$(CONTAINER_NAME)'..."
	@echo "✅ Accede a la aplicación en http://localhost:8080"
	docker run --rm -d --name $(CONTAINER_NAME) -p 8080:8080 $(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: docker-stop
docker-stop: ## Detiene el contenedor Docker en ejecución
	@echo "🛑 Deteniendo el contenedor '$(CONTAINER_NAME)'..."
	-docker stop $(CONTAINER_NAME)

# ====================================================================================
# Limpieza
# ====================================================================================

.PHONY: clean
clean: ## Elimina los artefactos de construcción y las dependencias instaladas
	@echo "🧹 Limpiando el proyecto..."
	rm -rf .next
	rm -rf out
	rm -rf node_modules
	rm -rf .DS_Store
	@echo "Limpieza completada."

.PHONY: full-clean
full-clean: clean ## Limpia todo, incluyendo la imagen de Docker
	@echo "🗑️ Eliminando la imagen de Docker $(IMAGE_NAME):$(IMAGE_TAG)..."
	-docker rmi $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Limpieza completa realizada."

