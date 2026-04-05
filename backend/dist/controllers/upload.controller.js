import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { textProcessingService } from '../utils/textProcessing.js';
import { embeddingService } from '../services/embedding.service.js';
import { pineconeService } from '../services/pinecone.service.js';
export class UploadController {
    upload;
    constructor() {
        // Configure multer for file uploads
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(process.cwd(), 'uploads'));
            },
            filename: (req, file, cb) => {
                const uniqueId = uuidv4();
                const extension = path.extname(file.originalname);
                cb(null, `${uniqueId}${extension}`);
            },
        });
        const fileFilter = (req, file, cb) => {
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            const allowedExtensions = ['.pdf', '.docx', '.txt'];
            const mimeTypeAllowed = allowedTypes.includes(file.mimetype);
            const extensionAllowed = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
            if (mimeTypeAllowed && extensionAllowed) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
            }
        };
        this.upload = multer({
            storage,
            fileFilter,
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
            },
        });
    }
    /**
     * Get multer upload middleware
     */
    getUploadMiddleware() {
        return this.upload.single('document');
    }
    /**
     * Handle document upload and processing
     */
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                const error = {
                    message: 'No file uploaded',
                    code: 'NO_FILE',
                };
                res.status(400).json(error);
                return;
            }
            const filePath = req.file.path;
            const documentId = uuidv4();
            console.log(`Processing uploaded file: ${req.file.originalname}`);
            // Validate file
            textProcessingService.validateFile(filePath);
            // Process document into chunks
            const chunks = await textProcessingService.processDocument(filePath, documentId, 1000, // chunk size
            200 // overlap
            );
            if (chunks.length === 0) {
                throw new Error('No content could be extracted from the document');
            }
            // Generate embeddings
            console.log('Generating embeddings...');
            const embeddingResult = await embeddingService.processDocumentChunks(chunks);
            // Store in Pinecone
            console.log('Storing embeddings in Pinecone...');
            await pineconeService.storeEmbeddings(chunks, embeddingResult.embeddings);
            // Clean up uploaded file
            textProcessingService.cleanupFile(filePath);
            const response = {
                success: true,
                documentId,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                chunksProcessed: chunks.length,
                message: `Document "${req.file.originalname}" processed successfully with ${chunks.length} chunks`,
            };
            console.log(`Document upload completed: ${documentId}`);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error in uploadDocument:', error);
            // Clean up file if it exists
            if (req.file?.path) {
                textProcessingService.cleanupFile(req.file.path);
            }
            const apiError = {
                message: error?.message || 'Failed to process document',
                code: 'PROCESSING_ERROR',
            };
            res.status(500).json(apiError);
        }
    }
    /**
     * Get upload status (for future implementation)
     */
    async getUploadStatus(req, res) {
        const { documentId } = req.params;
        // For now, return a placeholder response
        // In a real implementation, you might check processing status from a database
        res.status(200).json({
            documentId,
            status: 'completed',
            message: 'Document processing completed',
        });
    }
}
// Export singleton instance
export const uploadController = new UploadController();
