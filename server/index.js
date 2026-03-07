import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const client = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  apiKey: process.env.GOOGLE_API_KEY,
});
const queue = new Queue('file-upload-queue', {
  connection: {
    host: '127.0.0.1',
    port: '6379',
  }
})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})


const upload = multer({ storage: storage })

const app = express()
app.use(cors())

app.get('/', (req, res) => {
  return res.json({ status: 'All Good!' })
})

app.get('/chat', async (req, res) => {
  try {
    const userQuery = req.query.message;
    if (!userQuery) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'gemini-embedding-001',
      apiKey: process.env.GOOGLE_API_KEY,
    });

    let vectorStore;
    try {
      vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL,
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: 'pdf-chat-collection',
        });
    } catch (e) {
      console.error('Vector store collection not found or connection failed:', e.message);
      return res.status(404).json({
        message: "I don't have enough context yet. Please upload a PDF first and wait for it to be processed.",
        docs: []
      });
    }

    const result = await vectorStore.similaritySearch(userQuery, 5);

    const SYSTEM_PROMPT = `You are a helpful AI Assistant who answers the query based on uploaded pdf context ONLY. If the answer is not in the context, say you don't know based on the document.
        Context:
        ${result.map(d => d.pageContent).join('\n\n')}
        `;

    const chatResult = await client.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ])

    return res.json({ message: chatResult.content, docs: result })
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'An internal error occurred while processing your request.' });
  }
})

app.post('/upload/pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  queue.add('file-ready',
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    }))
  return res.json({ message: 'uploaded' })
})

app.listen(8000, () => console.log(`Server started on PORT:${8000}`))