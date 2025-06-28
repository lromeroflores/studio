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

## Deployment with Docker and Cloud Run

This application is configured to be deployed as a container using Docker, which is ideal for services like Google Cloud Run.

### 1. Build the Docker Image

From the root of your project, run the following command to build the Docker image. Replace `your-project-id` with your GCP project ID and `contract-ease-app` with your desired image name.

```bash
docker build -t gcr.io/your-project-id/contract-ease-app:latest .
```

### 2. Run the Container Locally (Optional)

To test the container on your local machine before deploying, run:

```bash
docker run -p 3000:3000 -e GOOGLE_API_KEY="your_api_key_here" gcr.io/your-project-id/contract-ease-app:latest
```

This command starts the container, maps port 3000 to your local machine, and passes the required API key as an environment variable. You should be able to access the app at `http://localhost:3000`.

### 3. Push the Image to Google Container Registry (GCR)

First, configure Docker to authenticate with GCR:
```bash
gcloud auth configure-docker
```

Then, push your image to the registry:
```bash
docker push gcr.io/your-project-id/contract-ease-app:latest
```

### 4. Deploy to Cloud Run

Deploy your container image to Cloud Run with the following command. This command sets crucial environment variables and memory limits.

```bash
gcloud run deploy contract-ease-service \
  --image gcr.io/your-project-id/contract-ease-app:latest \
  --platform managed \
  --region your-chosen-region \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_API_KEY=your_api_key_here" \
  --memory=1Gi
```

- Replace `your-chosen-region` with a region like `us-central1`.
- You will be prompted to set other options on the first deploy.
- For production, you should store your `GOOGLE_API_KEY` securely using [Secret Manager](https://cloud.google.com/secret-manager) and integrate it with Cloud Run.

This process provides a robust and scalable way to run your ContractEase application on Google Cloud.
