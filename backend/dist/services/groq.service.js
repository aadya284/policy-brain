import Groq from 'groq-sdk';
import { config } from '../config/index.js';
export class GroqService {
    groq;
    constructor() {
        if (!config.GROQ_API_KEY) {
            throw new Error('Groq API key is required');
        }
        this.groq = new Groq({
            apiKey: config.GROQ_API_KEY,
        });
    }
    /**
     * Generate an answer using the Groq LLM with retrieved context
     */
    async generateAnswer(query, context) {
        try {
            // Prepare context from retrieved matches
            const contextText = context
                .map(match => {
                const metadata = match.metadata;
                return `[Source: ${metadata.fileName}]\n${metadata.text}`;
            })
                .join('\n\n');
            const prompt = `You are an intelligent assistant that answers questions based on the provided context. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
${contextText}

Question: ${query}

Instructions:
1. Answer based only on the provided context
2. If the context is insufficient, state that clearly
3. Provide specific references to source documents when possible
4. Be concise but comprehensive
5. If relevant, explain your reasoning briefly

Answer:`;
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: config.GROQ_MODEL,
                temperature: 0.1, // Low temperature for factual responses
                max_tokens: 1000,
                top_p: 1,
                stream: false,
            });
            const answer = completion.choices[0]?.message?.content || 'No answer generated';
            // Extract sources from context
            const sources = context.map(match => {
                const metadata = match.metadata;
                return {
                    fileName: metadata.fileName,
                    fileType: metadata.fileType,
                    relevanceScore: match.score,
                    chunkIndex: metadata.chunkIndex,
                };
            });
            return {
                answer,
                sources,
                confidence: this.calculateConfidence(context),
                query,
            };
        }
        catch (error) {
            console.error('Error generating answer with Groq:', error);
            throw error;
        }
    }
    /**
     * Calculate confidence score based on retrieved context
     */
    calculateConfidence(context) {
        if (context.length === 0)
            return 0;
        // Average similarity score, normalized to 0-1 scale
        const avgScore = context.reduce((sum, match) => sum + match.score, 0) / context.length;
        // Boost confidence if we have multiple relevant sources
        const sourceBonus = Math.min(context.length * 0.1, 0.3);
        return Math.min(avgScore + sourceBonus, 1);
    }
    /**
     * Generate a summary of the query and context for logging/debugging
     */
    async generateSummary(query, context) {
        try {
            const contextPreview = context
                .slice(0, 3)
                .map(match => {
                const metadata = match.metadata;
                return `${metadata.fileName}: ${metadata.text.substring(0, 200)}...`;
            })
                .join('\n');
            const summaryPrompt = `Summarize the following query and its context in 2-3 sentences:

Query: ${query}

Context Preview:
${contextPreview}

Summary:`;
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: summaryPrompt,
                    },
                ],
                model: config.GROQ_MODEL,
                temperature: 0.3,
                max_tokens: 200,
                top_p: 1,
                stream: false,
            });
            return completion.choices[0]?.message?.content || 'Summary not available';
        }
        catch (error) {
            console.error('Error generating summary:', error);
            return 'Summary generation failed';
        }
    }
}
// Export singleton instance
export const groqService = new GroqService();
