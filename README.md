# Policy Brain - LLM-Powered Intelligent Query-Retrieval System

A distributed application for intelligent document analysis using AI-powered insights across Insurance, Legal, HR, and Compliance domains.

## Project Structure

This is a monorepo containing both frontend and backend applications:

```
policy-brain/
├── frontend/          # Next.js React application
│   ├── app/          # Next.js app router pages
│   ├── components/   # Reusable React components
│   ├── lib/          # Client-side utilities and API calls
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/           # Node.js Express API server
│   ├── src/          # TypeScript source code
│   ├── dist/         # Compiled JavaScript
│   ├── uploads/      # File upload directory
│   └── package.json  # Backend dependencies
└── package.json      # Monorepo root with shared scripts
```

## Features

- **Multi-Format Document Support**: Upload and process PDF, DOCX, and TXT files
- **AI-Powered Analysis**: Intelligent document analysis with semantic search
- **Vector Embeddings**: Local sentence-transformer embeddings for document chunks
- **LLM Integration**: Groq Cloud LLaMA 3 for contextual answer generation
- **Vector Database**: Pinecone for efficient similarity search
- **Domain-Specific Intelligence**: Tailored for Insurance, Legal, HR, and Compliance

## Prerequisites

- Node.js 18+
- npm or yarn
- Pinecone account and API key
- Groq Cloud API key

## Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd policy-brain
   npm install
   npm run install:all
   ```

2. **Set up environment variables:**

   **Backend (.env):**
   ```bash
   # Environment Configuration
   NODE_ENV=development
   PORT=5001

   # Pinecone Configuration
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=policy-brain-index
   PINECONE_ENVIRONMENT=us-east-1

   # Groq Configuration
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama3-8b-8192

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads

   # Embedding Configuration
   CHUNK_SIZE=1000
   CHUNK_OVERLAP=200
   ```

   **Frontend (.env.local):**
   ```bash
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
   ```

## Development

### Running Both Services Together

```bash
npm run dev
```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5001) concurrently.

### Running Services Individually

**Frontend only:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

**Backend only:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

## API Endpoints

- **Health Check**: `GET /health`
- **Upload Document**: `POST /api/upload`
- **Query Documents**: `POST /api/query`
- **List Documents**: `GET /api/documents`

## Building for Production

```bash
# Build both services
npm run build

# Start production servers
npm run start
```

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Pinecone** - Vector database
- **Groq Cloud** - LLM API
- **Xenova Transformers** - Local embeddings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

   **Backend (.env):**
   ```env
   PINECONE_API_KEY=your_pinecone_api_key
   GROQ_API_KEY=your_groq_api_key
   PINECONE_INDEX_NAME=policy-brain-index
   PINECONE_ENVIRONMENT=us-east-1
   ```

   **Frontend (.env.local):**
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
   ```

## Development

### Start both services:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3005
- Backend: http://localhost:5001

### Start services individually:

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

## API Endpoints

### Document Upload
```http
POST /api/upload
Content-Type: multipart/form-data
```
Upload documents for processing and embedding.

### Query Documents
```http
POST /api/query
Content-Type: application/json
```
Query documents with natural language questions.

### System Status
```http
GET /api/status
```
Get system health and statistics.

## Building for Production

```bash
npm run build
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
npm run start
```

### Backend (Railway, Heroku, etc.)
```bash
cd backend
npm run build
npm run start
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **AI/ML**: Groq SDK, @xenova/transformers
- **Database**: Pinecone Vector Database
- **File Processing**: pdf-parse, mammoth
- **Security**: Helmet, CORS

## Contributing

1. Install dependencies: `npm run install:all`
2. Start development: `npm run dev`
3. Make changes to frontend/ or backend/
4. Test both services work together
5. Submit pull request

## License

This project is licensed under the MIT License.
