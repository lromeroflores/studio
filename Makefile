env=dev
IMAGE_NAME = contract-ease-app


local-build:
	docker build -t $(IMAGE_NAME) .

local-run:
	docker run -p 3000:3000 \
		-e GOOGLE_API_KEY=$(shell grep GOOGLE_API_KEY conf/.env.dev.yaml | awk '{ print $$2 }') \
		$(IMAGE_NAME)

local: local-build local-run

deploy:
	gcloud builds submit --config=./build/cloudbuild.yaml --project=covalto-ai-services-$(env) --region=us-central1 --substitutions=_ENV=$(env)

