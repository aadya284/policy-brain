import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import apiRoutes from './routes/api.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { pineconeService } from './services/pinecone.service.js';
import { embeddingService } from './services/embedding.service.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = config.PORT;
// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? config.FRONTEND_URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3005', 'http://127.0.0.1:3005'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Static file serving for uploads (in development only)
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
// API routes
app.use('/api', apiRoutes);
// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);
// Initialize services and start server
async function startServer() {
    try {
        console.log('Initializing services...');
        // Initialize Pinecone
        await pineconeService.initializeIndex();
        // Initialize embedding service
        await embeddingService.initialize();
        console.log('All services initialized successfully');
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`💚 Health check at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
// Start the server
startServer();
