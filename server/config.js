import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export const redisConfig = {
    host: '127.0.0.1',
    port: '6379',
};

export const getEmbeddings = () => new GoogleGenerativeAIEmbeddings({
    model: 'gemini-embedding-001',
    apiKey: process.env.GOOGLE_API_KEY,
});

export const qdrantConfig = {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: 'pdf-chat-collection',
};
