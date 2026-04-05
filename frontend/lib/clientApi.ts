const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

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
  answer?: string
  decision?: string
  justification?: string
  relevant_documents?: Document[]
}

const handleResponse = async (response: Response) => {
  const body = await response.json()
  if (!response.ok) {
    throw new Error(body?.message || `Request failed with ${response.status}`)
  }
  return body
}

export const clientApi = {
  initialize: async () => {
    const response = await fetch(`${BACKEND_URL}/api/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return handleResponse(response)
  },

  getDocuments: async (): Promise<Document[]> => {
    // Placeholder: no documents endpoint is available in the backend yet.
    return []
  },

  uploadDocument: async (file: File, document_type: string): Promise<Document> => {
    const formData = new FormData()
    formData.append('document', file)

    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    const result = await handleResponse(response)

    return {
      id: result.documentId || `${Date.now()}-${file.name}`,
      filename: result.fileName || file.name,
      document_type,
      status: result.success ? 'processed' : 'error',
      created_at: new Date().toISOString(),
      content: undefined,
      vector_id: result.documentId || undefined,
    }
  },

  processQuery: async (request: QueryRequest): Promise<QueryResponse> => {
    const response = await fetch(`${BACKEND_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return handleResponse(response)
  },

  getQueries: async (): Promise<QueryResponse[]> => {
    return []
  },
}
