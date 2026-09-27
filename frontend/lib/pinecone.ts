/**
 * Pinecone vector operations are handled securely by the backend service:
 * backend/src/services/pinecone.service.ts
 *
 * For frontend requests, use clientApi from '@/lib/clientApi' to interact with the backend.
 */

export const isConfigured = Boolean(process.env.NEXT_PUBLIC_BACKEND_URL)