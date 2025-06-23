# PDF Chatbot with RAG Frontend

This is the Next.js frontend for the PDF chat RAG application. It provides a modern, streaming chat UI and connects to the backend for PDF upload and chat.

**Backend repo:** [pdf-chatbot-backend](https://github.com/bablukpik/pdf-chatbot-backend)

## Features

- Upload PDF files
- Streaming chat interface (like ChatGPT)
- Shows AI answers and sources from your PDFs

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Copy and configure environment variables:**
   ```sh
   cp .env.local.example .env.local
   # Edit .env.local and set NEXT_PUBLIC_API_URL to your backend URL
   ```
3. **Start the frontend:**
   ```sh
   npm run dev
   ```

## Environment Variables

See `.env.local.example` for all required variables:

- `NEXT_PUBLIC_API_URL`: The URL of your backend (e.g., http://localhost:8000)

## Usage

- Upload a PDF using the left panel.
- Ask questions in the chat interface on the right.
- The chat UI streams the AI's response in real-time using a custom streaming implementation (Server-Sent Events/SSE).

## Streaming Chat

- The chat UI uses a custom fetch and streaming logic to connect to the backend `/chat` endpoint and display streaming responses as they arrive.

## License

MIT
