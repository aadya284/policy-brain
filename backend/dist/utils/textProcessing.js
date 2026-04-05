import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
export class TextProcessingService {
    /**
     * Extract text from PDF file
     */
    async extractTextFromPDF(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        }
        catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error(`Failed to extract text from PDF: ${error?.message || 'Unknown error'}`);
        }
    }
    /**
     * Extract text from DOCX file
     */
    async extractTextFromDOCX(filePath) {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }
        catch (error) {
            console.error('Error extracting text from DOCX:', error);
            throw new Error(`Failed to extract text from DOCX: ${error?.message || 'Unknown error'}`);
        }
    }
    /**
     * Extract text from TXT file
     */
    async extractTextFromTXT(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf-8');
        }
        catch (error) {
            console.error('Error reading TXT file:', error);
            throw new Error(`Failed to read TXT file: ${error?.message || 'Unknown error'}`);
        }
    }
    /**
     * Extract text from any supported file type
     */
    async extractText(filePath) {
        const extension = path.extname(filePath).toLowerCase();
        switch (extension) {
            case '.pdf':
                return this.extractTextFromPDF(filePath);
            case '.docx':
                return this.extractTextFromDOCX(filePath);
            case '.txt':
                return this.extractTextFromTXT(filePath);
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }
    /**
     * Split text into chunks with overlap
     */
    splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
        if (!text || text.trim().length === 0) {
            return [];
        }
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            let end = start + chunkSize;
            // If we're not at the end, try to find a good breaking point
            if (end < text.length) {
                // Look for sentence endings within the last 100 characters
                const lastPeriod = text.lastIndexOf('.', end);
                const lastNewline = text.lastIndexOf('\n', end);
                const lastSpace = text.lastIndexOf(' ', end);
                // Use the best breaking point found
                if (lastPeriod > end - 100) {
                    end = lastPeriod + 1;
                }
                else if (lastNewline > end - 100) {
                    end = lastNewline;
                }
                else if (lastSpace > end - 100) {
                    end = lastSpace;
                }
            }
            const chunk = text.slice(start, end).trim();
            if (chunk.length > 0) {
                chunks.push(chunk);
            }
            // Move start position with overlap
            start = Math.max(start + 1, end - overlap);
        }
        return chunks;
    }
    /**
     * Create document chunks with metadata
     */
    createDocumentChunks(text, metadata, chunkSize = 1000, overlap = 200) {
        const textChunks = this.splitTextIntoChunks(text, chunkSize, overlap);
        return textChunks.map((chunkText, index) => ({
            id: `${metadata.source}_${index}`,
            text: chunkText,
            metadata: {
                ...metadata,
                chunkIndex: index,
                totalChunks: textChunks.length,
            },
        }));
    }
    /**
     * Process a document file and return chunks
     */
    async processDocument(filePath, sourceId, chunkSize = 1000, overlap = 200) {
        try {
            const fileName = path.basename(filePath);
            const fileType = path.extname(filePath).toLowerCase();
            // Extract text from the file
            const text = await this.extractText(filePath);
            if (!text || text.trim().length === 0) {
                throw new Error('No text content found in the document');
            }
            // Create metadata
            const metadata = {
                source: sourceId,
                fileName,
                fileType,
                uploadedAt: new Date().toISOString(),
            };
            // Create chunks
            const chunks = this.createDocumentChunks(text, metadata, chunkSize, overlap);
            console.log(`Processed document ${fileName}: ${chunks.length} chunks created`);
            return chunks;
        }
        catch (error) {
            console.error('Error processing document:', error);
            throw error;
        }
    }
    /**
     * Validate file type and size
     */
    validateFile(filePath, maxSizeMB = 10) {
        const stats = fs.statSync(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`);
        }
        const extension = path.extname(filePath).toLowerCase();
        const allowedExtensions = ['.pdf', '.docx', '.txt'];
        if (!allowedExtensions.includes(extension)) {
            throw new Error(`Unsupported file type: ${extension}. Allowed types: ${allowedExtensions.join(', ')}`);
        }
    }
    /**
     * Clean up temporary files
     */
    cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up file: ${filePath}`);
            }
        }
        catch (error) {
            console.warn(`Failed to cleanup file ${filePath}:`, error);
        }
    }
}
// Export singleton instance
export const textProcessingService = new TextProcessingService();
