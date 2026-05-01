import 'dotenv/config'
import { Worker } from 'bullmq';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { redisConfig, getEmbeddings, qdrantConfig } from './config.js';
import { QdrantVectorStore } from '@langchain/qdrant';

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    try {
      console.log('Job received:', job.data);

      const data = JSON.parse(job.data);
      if (!data.buffer) {
        throw new Error('Missing PDF buffer in job data');
      }

      const buffer = Buffer.from(data.buffer, 'base64');
      const blob = new Blob([buffer], { type: data.mimetype || 'application/pdf' });

      const loader = new PDFLoader(blob);
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await splitter.splitDocuments(docs);
      console.log(`Split into ${splitDocs.length} chunks`);

      const embeddings = getEmbeddings();

      const vectorStore = await QdrantVectorStore.fromDocuments(
        splitDocs,
        embeddings,
        qdrantConfig
      );

      console.log('All chunks are added to vector store ');
    } catch (err) {
      console.error('Worker job failed:', err);
      throw err;
    }
  },
  { connection: redisConfig }
);

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
worker.on('error', (err) => {
  console.error('Worker error:', err);
});