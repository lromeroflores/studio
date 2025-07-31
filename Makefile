# ==============================================================================
# Makefile para el Proyecto ContractEase
#
# Este archivo proporciona comandos convenientes para gestionar el ciclo de vida
# de la aplicación, desde el desarrollo local hasta el despliegue.
# ==============================================================================

# Configuración de la imagen Docker
# Obtiene el SHA corto del commit actual para usarlo como etiqueta de la imagen.
GIT_SHORT_SHA := $(shell git rev-parse --short HEAD)
DOCKER_IMAGE_NAME := contract-ease
DOCKER_IMAGE_TAG := $(GIT_SHORT_SHA)

.PHONY: help build push run-local dev-next dev-genkit lint lint-fix format clean

help:
	@echo "Comandos disponibles:"
	@echo "  make build          Construye la imagen de Docker para la aplicación."
	@echo "  make push           Sube la imagen de Docker a un registro (requiere configuración)."
	@echo "  make run-local      Ejecuta la aplicación en un contenedor Docker localmente."
	@echo "  make dev-next       Inicia el servidor de desarrollo de Next.js."
	@echo "  make dev-genkit     Inicia el servidor de desarrollo de Genkit."
	@echo "  make lint           Ejecuta el linter para verificar la calidad del código."
	@echo "  make lint-fix       Intenta corregir automáticamente los problemas de lint."
	@echo "  make format         Formatea todo el código usando Prettier."
	@echo "  make clean          Elimina las imágenes de Docker locales de este proyecto."

# Construye la imagen de Docker
build:
	@echo "Construyendo imagen de Docker: $(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)..."
	docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG) .

# Sube la imagen de Docker a un registro (ej. Google Artifact Registry)
# Asegúrate de haberte autenticado primero (ej. gcloud auth configure-docker)
push:
	@echo "Subiendo imagen de Docker a un registro..."
	# Reemplaza 'your-registry-url' con la URL de tu registro de contenedores.
	# docker tag $(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG) your-registry-url/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)
	# docker push your-registry-url/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)
	@echo "Comando 'push' necesita ser configurado con la URL de tu registro."

# Ejecuta la aplicación en un contenedor Docker localmente en el puerto 3000
run-local:
	@echo "Ejecutando la aplicación en un contenedor Docker en http://localhost:3000..."
	docker run --rm -p 3000:3000 --env-file .env $(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)

# Inicia el servidor de desarrollo de Next.js
dev-next:
	@echo "Iniciando el servidor de desarrollo de Next.js..."
	npm run dev

# Inicia el servidor de desarrollo de Genkit para los flujos de IA
dev-genkit:
	@echo "Iniciando el watcher de Genkit..."
	npm run genkit:watch

# Ejecuta el linter para revisar la calidad del código
lint:
	@echo "Ejecutando linter..."
	npm run lint

# Intenta corregir automáticamente los problemas de linting
lint-fix:
	@echo "Intentando corregir problemas de lint..."
	npm run lint:fix

# Formatea el código con Prettier
format:
	@echo "Formateando el código con Prettier..."
	npm run format

# Elimina las imágenes de Docker creadas para este proyecto
clean:
	@echo "Eliminando imágenes de Docker locales para $(DOCKER_IMAGE_NAME)..."
	docker rmi -f $(shell docker images -q $(DOCKER_IMAGE_NAME))
