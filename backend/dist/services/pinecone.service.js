import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../config/index.js';
export class PineconeService {
    pinecone;
    indexName;
    constructor() {
        if (!config.PINECONE_API_KEY) {
            throw new Error('Pinecone API key is required');
        }
        this.pinecone = new Pinecone({
            apiKey: config.PINECONE_API_KEY,
        });
        this.indexName = config.PINECONE_INDEX_NAME;
    }
    /**
     * Initialize the Pinecone index if it doesn't exist
     */
    async initializeIndex() {
        try {
            const indexList = await this.pinecone.listIndexes();
            const indexExists = indexList.indexes?.some(index => index.name === this.indexName);
            if (!indexExists) {
                console.log(`Creating Pinecone index: ${this.indexName}`);
                await this.pinecone.createIndex({
                    name: this.indexName,
                    dimension: 384, // sentence-transformers all-MiniLM-L6-v2 dimension
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: config.PINECONE_ENVIRONMENT,
                        },
                    },
                });
                // Wait for index to be ready
                console.log('Waiting for index to be ready...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
            console.log(`Pinecone index ${this.indexName} is ready`);
        }
        catch (error) {
            console.error('Error initializing Pinecone index:', error);
            throw error;
        }
    }
    /**
     * Get the Pinecone index instance
     */
    getIndex() {
        return this.pinecone.index(this.indexName);
    }
    /**
     * Store document chunks with their embeddings
     */
    async storeEmbeddings(chunks, embeddings) {
        try {
            const index = this.getIndex();
            const vectors = chunks.map((chunk, index) => ({
                id: chunk.id,
                values: embeddings[index],
                metadata: {
                    text: chunk.text,
                    source: chunk.metadata.source,
                    chunkIndex: chunk.metadata.chunkIndex,
                    totalChunks: chunk.metadata.totalChunks,
                    fileName: chunk.metadata.fileName,
                    fileType: chunk.metadata.fileType,
                    uploadedAt: chunk.metadata.uploadedAt,
                },
            }));
            // Upsert vectors in batches to avoid payload size limits
            const batchSize = 100;
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await index.upsert(batch);
            }
            console.log(`Stored ${vectors.length} vectors in Pinecone`);
        }
        catch (error) {
            console.error('Error storing embeddings in Pinecone:', error);
            throw error;
        }
    }
    /**
     * Query similar vectors
     */
    async queryEmbeddings(queryEmbedding, topK = 5) {
        try {
            const index = this.getIndex();
            const queryResponse = await index.query({
                vector: queryEmbedding,
                topK,
                includeMetadata: true,
                includeValues: false,
            });
            return (queryResponse.matches || []).map(match => ({
                id: match.id,
                score: match.score || 0,
                values: match.values,
                metadata: match.metadata,
            }));
        }
        catch (error) {
            console.error('Error querying Pinecone:', error);
            throw error;
        }
    }
    /**
     * Delete vectors by document ID prefix
     */
    async deleteDocument(documentId) {
        try {
            const index = this.getIndex();
            // Delete all vectors with the document ID prefix
            await index.deleteMany({
                filter: {
                    source: { $eq: documentId }
                }
            });
            console.log(`Deleted vectors for document: ${documentId}`);
        }
        catch (error) {
            console.error('Error deleting document from Pinecone:', error);
            throw error;
        }
    }
    /**
     * Get index statistics
     */
    async getIndexStats() {
        try {
            const index = this.getIndex();
            return await index.describeIndexStats();
        }
        catch (error) {
            console.error('Error getting index stats:', error);
            throw error;
        }
    }
}
// Export singleton instance
export const pineconeService = new PineconeService();
