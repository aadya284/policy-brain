import { pipeline } from '@xenova/transformers';
import { config } from '../config/index.js';
import { DocumentChunk, EmbeddingResult } from '../types/index.js';

export class EmbeddingService {
  private extractor: any = null;

  /**
   * Initialize the sentence transformer model
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing sentence transformer model...');
      this.extractor = await pipeline('feature-extraction', config.EMBEDDING_MODEL);
      console.log('Sentence transformer model initialized');
    } catch (error) {
      console.error('Error initializing embedding model:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      if (!this.extractor) {
        await this.initialize();
      }

      const embeddings: number[][] = [];

      // Process texts in batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

        const batchEmbeddings = await Promise.all(
          batch.map(async (text) => {
            const output = await this.extractor(text, { pooling: 'mean', normalize: true });
            return Array.from(output.data as number[]);
          })
        );

        embeddings.push(...batchEmbeddings);
      }

      console.log(`Generated ${embeddings.length} embeddings`);
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single query
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      if (!this.extractor) {
        await this.initialize();
      }

      const output = await this.extractor(query, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw error;
    }
  }

  /**
   * Process document chunks and generate embeddings
   */
  async processDocumentChunks(chunks: DocumentChunk[]): Promise<EmbeddingResult> {
    try {
      const texts = chunks.map(chunk => chunk.text);
      const embeddings = await this.generateEmbeddings(texts);

      return {
        chunks,
        embeddings,
        model: config.EMBEDDING_MODEL,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error processing document chunks:', error);
      throw error;
    }
  }

  /**
   * Validate that the embedding model is loaded
   */
  isInitialized(): boolean {
    return this.extractor !== null;
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model: config.EMBEDDING_MODEL,
      initialized: this.isInitialized(),
      dimension: 384, // sentence-transformers all-MiniLM-L6-v2 dimension
    };
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();