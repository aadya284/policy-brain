import { getIndex, initializeIndex } from './pinecone'

export interface Document {
  id: string
  filename: string
  document_type: string
  status: string
  created_at: string
  content?: string
  vector_id?: string
}

export interface QueryRequest {
  query: string
  document_id?: string
}

export interface QueryResponse {
  id: string
  query: string
  created_at?: string
  decision?: string
  justification?: string
  relevant_documents?: Document[]
}

// Simple text embedding function (placeholder - in production you'd use OpenAI or similar)
const generateEmbedding = async (text: string): Promise<number[]> => {
  // This is a placeholder - in production, use OpenAI's embedding API
  // For now, we'll create a simple hash-based vector
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)

  // Create a 1536-dimensional vector (same as OpenAI's text-embedding-ada-002)
  const vector: number[] = []
  for (let i = 0; i < 1536; i++) {
    vector.push((Math.sin(hash + i) + 1) / 2) // Normalize to 0-1
  }

  return vector
}

export const api = {
  // Initialize Pinecone index
  initialize: async () => {
    try {
      await initializeIndex()
      console.log('Pinecone index initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error)
      throw error
    }
  },

  // Get all documents
  getDocuments: async (): Promise<Document[]> => {
    try {
      const index = getIndex()
      const queryResponse = await index.query({
        vector: new Array(1536).fill(0.5), // Dummy vector to get all documents
        topK: 1000,
        includeMetadata: true,
        includeValues: false
      })

      return queryResponse.matches?.map(match => ({
        id: match.id,
        filename: match.metadata?.filename as string || '',
        document_type: match.metadata?.document_type as string || '',
        status: match.metadata?.status as string || 'processed',
        created_at: match.metadata?.created_at as string || new Date().toISOString(),
        content: match.metadata?.content as string,
        vector_id: match.id
      })) || []
    } catch (error) {
      console.error('Error fetching documents:', error)
      return []
    }
  },

  // Upload and store document in Pinecone
  uploadDocument: async (file: File, document_type: string): Promise<Document> => {
    try {
      const index = getIndex()

      // Read file content (simplified - in production you'd parse PDFs, DOCX, etc.)
      const content = await file.text()
      const vector = await generateEmbedding(content)

      const documentId = `${Date.now()}-${file.name}`
      const vectorId = `doc-${documentId}`

      // Store in Pinecone
      await index.upsert([{
        id: vectorId,
        values: vector,
        metadata: {
          filename: file.name,
          document_type,
          status: 'processed',
          created_at: new Date().toISOString(),
          content: content.substring(0, 1000), // Store first 1000 chars as metadata
          file_size: file.size
        }
      }])

      return {
        id: documentId,
        filename: file.name,
        document_type,
        status: 'processed',
        created_at: new Date().toISOString(),
        content,
        vector_id: vectorId
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  },

  // Process query using semantic search
  processQuery: async (request: QueryRequest): Promise<QueryResponse> => {
    try {
      const index = getIndex()
      const queryVector = await generateEmbedding(request.query)

      let filter = {}
      if (request.document_id) {
        // If specific document is requested, we need to find its vector ID
        // This is a simplified approach - in production you'd maintain a mapping
        filter = { filename: { $eq: request.document_id } }
      }

      const queryResponse = await index.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
        includeValues: false,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      })

      const relevantDocuments = queryResponse.matches?.map(match => ({
        id: match.id,
        filename: match.metadata?.filename as string || '',
        document_type: match.metadata?.document_type as string || '',
        status: match.metadata?.status as string || 'processed',
        created_at: match.metadata?.created_at as string || new Date().toISOString(),
        content: match.metadata?.content as string,
        vector_id: match.id
      })) || []

      // Generate response based on relevant documents
      let response = "I couldn't find relevant information in the documents."
      if (relevantDocuments.length > 0) {
        const topDocument = relevantDocuments[0]
        response = `Based on the document "${topDocument.filename}", I found relevant information. ${topDocument.content ? `Key content: ${topDocument.content.substring(0, 200)}...` : ''}`
      }

      return {
        id: `${Date.now()}`,
        query: request.query,
        created_at: new Date().toISOString(),
        decision: response,
        justification: `Found ${relevantDocuments.length} relevant document(s)`,
        relevant_documents: relevantDocuments
      }
    } catch (error) {
      console.error('Error processing query:', error)
      return {
        id: `${Date.now()}`,
        query: request.query,
        decision: "I'm sorry, I encountered an error while processing your query.",
        justification: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  },

  // Get recent queries (placeholder - in production you'd store this in a database)
  getQueries: async (): Promise<QueryResponse[]> => {
    // This is a placeholder - in production you'd have a database for query history
    return []
  }
}
