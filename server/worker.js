import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

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
      console.log(`Loaded ${docs.length} docs from PDF`);

      const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_KEY,
      });

      const vectorStore = await QdrantVectorStore.fromDocuments(
        docs,
        embeddings,
        {
          url: 'http://localhost:6333',
          collectionName: 'langchainjs-testing',
        }
      );
      await vectorStore.addDocuments(docs);

      console.log('All Docs are added to vector store ');
    } catch (err) {
      console.error('Worker job failed:', err);
      throw err;
    }
  },
  { connection: { host: 'localhost', port: 6379 } }
);

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
worker.on('error', (err) => {
  console.error('Worker error:', err);
});