export interface BaseDocumentMetadata {
  source: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface DocumentMetadata extends BaseDocumentMetadata {
  chunkIndex: number;
  totalChunks: number;
}

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: DocumentMetadata;
}

export interface UploadResponse {
  success: boolean;
  documentId: string;
  fileName: string;
  fileSize: number;
  chunksProcessed: number;
  message: string;
}

export interface QueryRequest {
  query: string;
  topK?: number;
  documentId?: string;
}

export interface SourceInfo {
  fileName: string;
  fileType: string;
  relevanceScore: number;
  chunkIndex: number;
}

export interface QueryResponse {
  answer: string;
  sources: SourceInfo[];
  confidence: number;
  query: string;
}

export interface EmbeddingResult {
  chunks: DocumentChunk[];
  embeddings: number[][];
  model: string;
  generatedAt: string;
}

export interface PineconeMatch {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, any>;
}

export interface ApiError {
  message: string;
  code: string;
  details?: string;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}