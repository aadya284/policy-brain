import { DocumentChunk, EmbeddingResult } from '../types/index.js';
export declare class EmbeddingService {
    private extractor;
    /**
     * Initialize the sentence transformer model
     */
    initialize(): Promise<void>;
    /**
     * Generate embeddings for text chunks
     */
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    /**
     * Generate embedding for a single query
     */
    generateQueryEmbedding(query: string): Promise<number[]>;
    /**
     * Process document chunks and generate embeddings
     */
    processDocumentChunks(chunks: DocumentChunk[]): Promise<EmbeddingResult>;
    /**
     * Validate that the embedding model is loaded
     */
    isInitialized(): boolean;
    /**
     * Get model information
     */
    getModelInfo(): {
        model: string;
        initialized: boolean;
        dimension: number;
    };
}
export declare const embeddingService: EmbeddingService;
