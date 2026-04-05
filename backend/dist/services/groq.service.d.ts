import { QueryResponse, PineconeMatch } from '../types/index.js';
export declare class GroqService {
    private groq;
    constructor();
    /**
     * Generate an answer using the Groq LLM with retrieved context
     */
    generateAnswer(query: string, context: PineconeMatch[]): Promise<QueryResponse>;
    /**
     * Calculate confidence score based on retrieved context
     */
    private calculateConfidence;
    /**
     * Generate a summary of the query and context for logging/debugging
     */
    generateSummary(query: string, context: PineconeMatch[]): Promise<string>;
}
export declare const groqService: GroqService;
