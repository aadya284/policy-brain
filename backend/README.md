# LLM-Powered Intelligent Query-Retrieval System - Backend

A production-ready backend for an intelligent document query system that uses natural language processing, vector embeddings, and large language models to provide contextual answers from uploaded documents.

## Features

- **Document Upload**: Support for PDF, DOCX, and TXT files
- **Text Extraction**: Automatic text extraction from various document formats
- **Vector Embeddings**: Local sentence-transformer embeddings for document chunks
- **Vector Storage**: Pinecone vector database for efficient similarity search
- **Natural Language Queries**: Groq LLM integration for intelligent answer generation
- **RESTful API**: Clean API endpoints for upload and query operations
- **Error Handling**: Comprehensive error handling and validation
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Vector Database**: Pinecone
- **LLM**: Groq Cloud (LLaMA 3)
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **Document Processing**: pdf-parse, mammoth
- **File Upload**: Multer
- **Security**: Helmet, CORS

## Prerequisites

- Node.js 18+
- npm or yarn
- Pinecone account and API key
- Groq Cloud API key

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the `.env` file and update the values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   PINECONE_API_KEY=your_pinecone_api_key
   GROQ_API_KEY=your_groq_api_key
   PINECONE_INDEX_NAME=your_index_name
   PINECONE_ENVIRONMENT=your_pinecone_environment
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

The server will start on port 3001 by default.

## API Endpoints

### Upload Document
```http
POST /api/upload
Content-Type: multipart/form-data

Form field: document (file)
```

**Response:**
```json
{
  "success": true,
  "documentId": "uuid",
  "fileName": "document.pdf",
  "fileSize": 12345,
  "chunksProcessed": 42,
  "message": "Document processed successfully"
}
```

### Query Documents
```http
POST /api/query
Content-Type: application/json

{
  "query": "What is the company's policy on remote work?",
  "topK": 5
}
```

**Response:**
```json
{
  "answer": "The company allows flexible remote work arrangements...",
  "sources": [
    {
      "fileName": "hr_policy.pdf",
      "fileType": ".pdf",
      "relevanceScore": 0.85,
      "chunkIndex": 3
    }
  ],
  "confidence": 0.82,
  "query": "What is the company's policy on remote work?"
}
```

### System Status
```http
GET /api/status
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "embedding": {
      "model": "Xenova/all-MiniLM-L6-v2",
      "initialized": true,
      "dimension": 384
    },
    "pinecone": {
      "indexName": "policy-brain",
      "dimension": 384,
      "indexFullness": 0.0,
      "totalVectorCount": 1250
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Architecture

```
src/
├── config/          # Configuration management
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/         # API route definitions
├── services/       # Business logic services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

### Key Components

- **PineconeService**: Handles vector storage and retrieval
- **GroqService**: Manages LLM interactions for answer generation
- **EmbeddingService**: Generates embeddings using sentence-transformers
- **TextProcessingService**: Extracts and chunks text from documents
- **UploadController**: Handles file uploads and document processing
- **QueryController**: Processes natural language queries

## Configuration

The application uses environment variables for configuration. See `src/config/index.ts` for all available options.

## Error Handling

The API returns structured error responses:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error information"
}
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables in production

3. Start the server:
   ```bash
   npm start
   ```

## Security Considerations

- File upload size limits (10MB)
- File type validation
- CORS configuration
- Helmet security headers
- Input validation and sanitization

## Performance

- Document chunking with overlap for better context
- Batch processing for embeddings
- Efficient vector similarity search
- Connection pooling for external services

## Monitoring

- Health check endpoint at `/health`
- System status endpoint at `/api/status`
- Structured logging throughout the application

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

This project is licensed under the MIT License.