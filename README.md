# ContractEase

This is a Next.js application for managing contracts, built with AI features powered by Genkit.

## Local Development

To get the application running on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later is recommended)
- npm or a compatible package manager
- [Docker](https://www.docker.com/get-started) (for containerized deployment)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (for deployment)
- [Make](https://www.gnu.org/software/make/) (for using the helper commands)

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

This project requires two separate processes to run concurrently. You can either run them manually or use the provided `Makefile`.

**Option A: Using Makefile (in two separate terminals)**

**Terminal 1:**
```bash
make dev-next
```

**Terminal 2:**
```bash
make dev-genkit
```

**Option B: Manually**

**Terminal 1: Start the Next.js Frontend**

```bash
npm run dev
```
This will start the main application, typically available at `http://localhost:3000`.

**Terminal 2: Start the Genkit AI Flows**

```bash
npm run genkit:watch
```
This starts the Genkit development server, which makes the AI functions available to your Next.js app.

Once both servers are running, you can open your browser to `http://localhost:3000` to use the application.

---

## Deployment (Kubernetes via Helm & Argo CD)

This application is configured to be deployed as a container using Docker and managed in Kubernetes with a Helm chart. The CircleCI pipeline automates this process.

### 1. Build the Docker Image

You can build the image manually or use `make`:

```bash
make build
```
This will build the image and tag it with the short git SHA.

---

### 2. Push the Image to Artifact Registry

Authenticate Docker with Artifact Registry:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Then push the image:

```bash
make push
```

---

### 3. Deploy

The deployment is handled by the CircleCI pipeline, which triggers an `argocd/sync` job. This tells Argo CD to pull the latest configuration from the `chart/` directory and apply it to the cluster.

---

### 🧪 Run Locally with Docker

To test the containerized application locally:

```bash
make run-local
```
This command reads the `GOOGLE_API_KEY` from your `.env` file and runs the container. Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Makefile Targets

| Command              | Description                                               |
|----------------------|-----------------------------------------------------------|
| `make build`         | Build the Docker image.                                   |
| `make push`          | Push the image to Artifact Registry.                      |
| `make dev-next`      | Run the Next.js frontend for local development.           |
| `make dev-genkit`    | Run the Genkit AI flows for local development.            |
| `make run-local`     | Run the app locally inside a Docker container.            |
| `make deploy ENV=dev`| Deploy the app to Cloud Run (example target).             |
| `make lint`          | Run the linter.                                           |
| `make lint-fix`      | Attempt to fix lint issues automatically.                 |
| `make format`        | Format the codebase with Prettier.                        |
| `make clean`         | Remove local Docker images created for this project.      |
| `make help`          | Show a list of all available commands.                    |

This setup ensures secure, repeatable, and scalable deployments for the ContractEase application using modern cloud-native tools.
