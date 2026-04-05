import express from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import { queryController } from '../controllers/query.controller.js';
const router = express.Router();
// Upload routes
router.post('/upload', uploadController.getUploadMiddleware(), uploadController.uploadDocument.bind(uploadController));
router.get('/upload/:documentId', uploadController.getUploadStatus.bind(uploadController));
// Query routes
router.post('/query', queryController.queryDocuments.bind(queryController));
router.get('/query/history', queryController.getQueryHistory.bind(queryController));
// System routes
router.get('/status', queryController.getSystemStatus.bind(queryController));
export default router;
