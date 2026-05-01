import express from 'express';
import bodyParser from 'body-parser';
import handler from './api/gerar-plano.js';

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Simula o comportamento de um serverless handler
app.post('/api/gerar-plano', async (req, res) => {
  await handler(req, res);
});

// Suporte para OPTIONS (CORS)
app.options('/api/gerar-plano', async (req, res) => {
  await handler(req, res);
});

app.listen(port, () => {
  console.log(`API Server rodando em http://localhost:${port}`);
  console.log(`Acesse http://localhost:3000 para ver o frontend`);
});
