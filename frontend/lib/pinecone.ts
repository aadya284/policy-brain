import { Pinecone } from '@pinecone-database/pinecone'

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is required')
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME environment variable is required')
}

if (!process.env.PINECONE_ENVIRONMENT) {
  throw new Error('PINECONE_ENVIRONMENT environment variable is required')
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

export const indexName = process.env.PINECONE_INDEX_NAME
export const environment = process.env.PINECONE_ENVIRONMENT

export const getIndex = () => {
  return pinecone.index(indexName)
}

export const initializeIndex = async () => {
  try {
    // Check if index exists
    const indexList = await pinecone.listIndexes()
    const indexExists = indexList.indexes?.some(index => index.name === indexName)

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${indexName}`)
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI text-embedding-ada-002 dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: environment
          }
        }
      })

      // Wait for index to be ready
      console.log('Waiting for index to be ready...')
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    return getIndex()
  } catch (error) {
    console.error('Error initializing Pinecone index:', error)
    throw error
  }
}