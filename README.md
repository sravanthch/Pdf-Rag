# Pdf-Summarizer

Pdf-Summarizer is a full-stack web application that allows users to upload PDF documents and interactively chat with their content. It leverages Retrieval-Augmented Generation (RAG) using Google's Gemini model and the Qdrant vector database to provide accurate, context-aware answers based on document contents.

## 🚀 Tech Stack

### Client
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Authentication**: Clerk
- **Icons**: Lucide React

### Server
- **Framework**: Express.js
- **AI & Processing**: LangChain, Google Generative AI (Gemini Flash)
- **Queue System**: BullMQ
- **Vector Database**: Qdrant
- **In-Memory Store**: Valkey (Redis fork)

## ✨ Features
- **Upload PDFs**: Extract text and convert document content to vector embeddings.
- **Chat Interface**: Ask natural language questions and get answers based ONLY on the context of the uploaded documents.
- **Background Processing**: PDF processing and embeddings generation are handled asynchronously using a Valkey-backed BullMQ worker to maintain responsiveness.
- **Efficient Retrieval**: Fast similarity search provided by Qdrant vector store.

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & Docker Compose (for running Valkey and Qdrant locally)

### Environment Setup

1. **Client**: Create a `.env` file in the `client` directory and add your Clerk authentication keys.
2. **Server**: Create a `.env` file in the `server` directory. Make sure to provide your Google API Key for LangChain/Gemini interactions.
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

### Running Locally

1. **Start Infrastructure Services**
   Fire up the Qdrant and Valkey containers using Docker Compose from the root directory:
   ```bash
   docker-compose up -d
   ```

2. **Start the Express Server**
   ```bash
   cd server
   pnpm install
   
   # You may need to run both the main API server and the queue worker
   node index.js
   node worker.js
   ```

3. **Start the Next.js Client**
   ```bash
   cd client
   pnpm install
   pnpm dev
   ```

4. **Open Application**
   Visit `http://localhost:3000` to use the application!