IMAGE_NAME   = contract-gen-app
IMAGE_TAG    ?= latest
CONTAINER_NAME = $(IMAGE_NAME)-dev

.PHONY: help
help:
	@echo "Uso: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)


.PHONY: install
install:
	npm install

.PHONY: dev
dev:
	npm run dev

.PHONY: lint
lint:
	npm run lint

.PHONY: format
format:
	npm run format

.PHONY: test
test:
	npm run test

.PHONY: docker-build
docker-build:
	@echo "🏗️ Construyendo la imagen de Docker: $(IMAGE_NAME):$(IMAGE_TAG)..."
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

.PHONY: docker-run
docker-run:
	@echo "🚀 Iniciando el contenedor '$(CONTAINER_NAME)'..."
	@echo "✅ Accede a la aplicación en http://localhost:8080"
	docker run --rm -d --name $(IMAGE_NAME)$(CONTAINER_NAME) -p 8080:8080 $(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: docker-stop
docker-stop:
	@echo "🛑 Deteniendo el contenedor '$(IMAGE_NAME)$(CONTAINER_NAME)'..."
	docker stop $(IMAGE_NAME)$(CONTAINER_NAME)

.PHONY: clean
clean:
	@echo "🧹 Limpiando..."
	rm -rf out
	rm -rf .next
	rm -rf node_modules
	rm -rf coverage
	rm -f .DS_Store

.PHONY: full-clean
full-clean: clean
	@echo "🧼 Eliminando la imagen de Docker $(IMAGE_NAME):$(IMAGE_TAG)..."
	-docker rmi $(IMAGE_NAME):$(IMAGE_TAG)
