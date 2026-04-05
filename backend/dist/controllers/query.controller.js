import { embeddingService } from '../services/embedding.service.js';
import { pineconeService } from '../services/pinecone.service.js';
import { groqService } from '../services/groq.service.js';
import { config } from '../config/index.js';
export class QueryController {
    /**
     * Handle natural language queries
     */
    async queryDocuments(req, res) {
        try {
            const { query, topK = 5 } = req.body;
            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                const error = {
                    message: 'Query is required and must be a non-empty string',
                    code: 'INVALID_QUERY',
                };
                res.status(400).json(error);
                return;
            }
            console.log(`Processing query: "${query}"`);
            // Generate embedding for the query
            console.log('Generating query embedding...');
            const queryEmbedding = await embeddingService.generateQueryEmbedding(query.trim());
            // Search for similar vectors in Pinecone
            console.log('Searching Pinecone for similar content...');
            const matches = await pineconeService.queryEmbeddings(queryEmbedding, topK);
            if (matches.length === 0) {
                const response = {
                    answer: 'No relevant information found in the uploaded documents.',
                    sources: [],
                    confidence: 0,
                    query,
                };
                res.status(200).json(response);
                return;
            }
            // Generate answer using Groq LLM
            console.log('Generating answer with Groq LLM...');
            const answer = await groqService.generateAnswer(query, matches);
            console.log(`Query processed successfully with ${matches.length} relevant sources`);
            res.status(200).json(answer);
        }
        catch (error) {
            console.error('Error in queryDocuments:', error);
            const apiError = {
                message: error?.message || 'Failed to process query',
                code: 'QUERY_ERROR',
            };
            res.status(500).json(apiError);
        }
    }
    /**
     * Get query history (for future implementation)
     */
    async getQueryHistory(req, res) {
        // For now, return a placeholder response
        // In a real implementation, you might store queries in a database
        res.status(200).json({
            queries: [],
            message: 'Query history feature not yet implemented',
        });
    }
    /**
     * Get system status and statistics
     */
    async getSystemStatus(req, res) {
        try {
            const embeddingStatus = embeddingService.getModelInfo();
            const pineconeStats = await pineconeService.getIndexStats();
            res.status(200).json({
                status: 'healthy',
                services: {
                    embedding: {
                        model: embeddingStatus.model,
                        initialized: embeddingStatus.initialized,
                        dimension: embeddingStatus.dimension,
                    },
                    pinecone: {
                        indexName: pineconeStats.name || config.PINECONE_INDEX_NAME,
                        dimension: pineconeStats.dimension || 384,
                        indexFullness: pineconeStats.indexFullness || 0,
                        totalVectorCount: pineconeStats.totalRecordCount || 0,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error('Error getting system status:', error);
            const apiError = {
                message: 'Failed to get system status',
                code: 'STATUS_ERROR',
            };
            res.status(500).json(apiError);
        }
    }
}
// Export singleton instance
export const queryController = new QueryController();
