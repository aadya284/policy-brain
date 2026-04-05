import { DocumentChunk, PineconeMatch } from '../types/index.js';
export declare class PineconeService {
    private pinecone;
    private indexName;
    constructor();
    /**
     * Initialize the Pinecone index if it doesn't exist
     */
    initializeIndex(): Promise<void>;
    /**
     * Get the Pinecone index instance
     */
    private getIndex;
    /**
     * Store document chunks with their embeddings
     */
    storeEmbeddings(chunks: DocumentChunk[], embeddings: number[][]): Promise<void>;
    /**
     * Query similar vectors
     */
    queryEmbeddings(queryEmbedding: number[], topK?: number): Promise<PineconeMatch[]>;
    /**
     * Delete vectors by document ID prefix
     */
    deleteDocument(documentId: string): Promise<void>;
    /**
     * Get index statistics
     */
    getIndexStats(): Promise<import("@pinecone-database/pinecone").IndexStatsDescription>;
}
export declare const pineconeService: PineconeService;
