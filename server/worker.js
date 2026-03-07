import 'dotenv/config'
import { Worker } from 'bullmq';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    try {
      console.log('Job received:', job.data);

      const data = JSON.parse(job.data);
      if (!data.path) {
        throw new Error('Missing PDF path in job data');
      }

      const loader = new PDFLoader(data.path);
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await splitter.splitDocuments(docs);
      console.log(`Split into ${splitDocs.length} chunks`);

      const embeddings = new GoogleGenerativeAIEmbeddings({
        model: 'gemini-embedding-001',
        apiKey: process.env.GOOGLE_API_KEY,
      });

      const vectorStore = await QdrantVectorStore.fromDocuments(
        splitDocs,
        embeddings,
        {
          url: process.env.QDRANT_URL,
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: 'pdf-chat-collection',
        }
      );

      console.log('All chunks are added to vector store ');
    } catch (err) {
      console.error('Worker job failed:', err);
      throw err;
    }
  },
  { connection: { host: '127.0.0.1', port: 6379 } }
);

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
worker.on('error', (err) => {
  console.error('Worker error:', err);
});