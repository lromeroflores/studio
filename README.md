# ContractEase

This is a Next.js application for managing contracts, built with AI features powered by Genkit.

## Getting Started

To get the application running on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later is recommended)
- npm or a compatible package manager

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
