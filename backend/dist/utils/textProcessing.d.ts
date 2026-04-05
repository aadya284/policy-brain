import { DocumentChunk, BaseDocumentMetadata } from '../types/index.js';
export declare class TextProcessingService {
    /**
     * Extract text from PDF file
     */
    extractTextFromPDF(filePath: string): Promise<string>;
    /**
     * Extract text from DOCX file
     */
    extractTextFromDOCX(filePath: string): Promise<string>;
    /**
     * Extract text from TXT file
     */
    extractTextFromTXT(filePath: string): Promise<string>;
    /**
     * Extract text from any supported file type
     */
    extractText(filePath: string): Promise<string>;
    /**
     * Split text into chunks with overlap
     */
    splitTextIntoChunks(text: string, chunkSize?: number, overlap?: number): string[];
    /**
     * Create document chunks with metadata
     */
    createDocumentChunks(text: string, metadata: BaseDocumentMetadata, chunkSize?: number, overlap?: number): DocumentChunk[];
    /**
     * Process a document file and return chunks
     */
    processDocument(filePath: string, sourceId: string, chunkSize?: number, overlap?: number): Promise<DocumentChunk[]>;
    /**
     * Validate file type and size
     */
    validateFile(filePath: string, maxSizeMB?: number): void;
    /**
     * Clean up temporary files
     */
    cleanupFile(filePath: string): void;
}
export declare const textProcessingService: TextProcessingService;
