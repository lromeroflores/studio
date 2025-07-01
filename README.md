# ContractEase

This is a Next.js application for managing contracts, built with AI features powered by Genkit.

## Local Development

To get the application running on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later is recommended)
- npm or a compatible package manager
- [Docker](https://www.docker.com/get-started) (for containerized deployment)

### 1. Set Up Environment Variables

The application uses Genkit to connect to Google's AI models. You'll need an API key for this.

1.  Create a file named `.env` in the root of the project.
2.  Add your Google AI API key to it:

    ```
    GOOGLE_API_KEY=your_api_key_here
    ```

    You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Install Dependencies

Open your terminal in the project's root directory and run:

```bash
npm install
```

### 3. Run the Development Servers

This project requires two separate processes to run concurrently in two different terminal windows:

**Terminal 1: Start the Next.js Frontend**

```bash
npm run dev
```

This will start the main application, typically available at `http://localhost:3000`.

**Terminal 2: Start the Genkit AI Flows**

```bash
npm run genkit:watch
```

This starts the Genkit development server, which makes the AI functions available to your Next.js app. The `--watch` flag will automatically restart it when you make changes to your AI flows.

Once both servers are running, you can open your browser to `http://localhost:3000` to use the application.

---

## Deployment Cloud Run

This application is configured to be deployed as a container using Docker, which is ideal for services like Google Cloud Run.

### 1. Build the Docker Image

You can build the image manually or use `make`:

```bash
make build
```

Equivalent to:

```bash
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-services/contract-ease-app .
```

Replace `YOUR_PROJECT_ID` with your actual GCP project ID.

---

### 2. Push the Image to Artifact Registry

Authenticate Docker with Artifact Registry:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Then push the image (or run `make push`):

```bash
make push
```

Equivalent to:

```bash
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-services/contract-ease-app
```

---

### 3. (Optional) Create or Update the Secret

If you haven’t created the secret yet:

```bash
echo -n "your_api_key_here" | gcloud secrets create google-api-key --data-file=-
```

To add a new version to an existing secret:

```bash
echo -n "your_api_key_here" | gcloud secrets versions add google-api-key --data-file=-
```

Ensure your Cloud Run **service account** has the following IAM role:

```bash
roles/secretmanager.secretAccessor
```

---

### 4. Deploy to Cloud Run

You can deploy using:

```bash
make deploy ENV=dev
```

This will:

- Use the image from Artifact Registry
- Inject the secret `google-api-key` as the `GOOGLE_API_KEY` environment variable
- Set memory and instance limits
- Add the environment label (`dev`, `staging`, `prod`, etc.)

Manual equivalent:

```bash
gcloud run deploy contract-ease-service \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-services/contract-ease-app \
  --platform managed \
  --region us-central1 \
  --memory=1Gi \
  --allow-unauthenticated \
  --service-account=invoke-eeff-data-extraction@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --update-secrets=GOOGLE_API_KEY=google-api-key:latest \
  --min-instances=0 \
  --max-instances=3 \
  --update-labels=environment=dev
```

> 🔐 `GOOGLE_API_KEY` will be available as a secure environment variable in your container.

---

### 🧪 Run Locally (Optional)

To test the container locally:

```bash
docker run -p 3000:3000 -e GOOGLE_API_KEY="your_api_key_here" us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-services/contract-ease-app
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Makefile Targets

| Command              | Description                         |
|----------------------|-------------------------------------|
| `make build`         | Build the Docker image              |
| `make push`          | Push the image to Artifact Registry |
| `make deploy ENV=dev`| Deploy the app to Cloud Run         |

Make sure your environment has `PROJECT_ID` exported if the Makefile relies on it.

---

This setup ensures secure, repeatable, and scalable deployments for the ContractEase application using modern GCP tools.
