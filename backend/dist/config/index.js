import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
export const config = {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Pinecone Configuration
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'llm-query-retrieval-docs',
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
    // Groq Configuration
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL || 'llama3-8b-8192',
    // File Upload Configuration
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    // Embedding Configuration
    CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE || '1000', 10),
    CHUNK_OVERLAP: parseInt(process.env.CHUNK_OVERLAP || '200', 10),
    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
};
// Validate required environment variables
const requiredEnvVars = [
    'PINECONE_API_KEY',
    'GROQ_API_KEY',
];
for (const envVar of requiredEnvVars) {
    if (!config[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
export default config;
