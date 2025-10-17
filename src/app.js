import express from 'express';
import apiRoutes from './routes/api.routes.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('LLM Code Deployer is running. 🚀');
});

app.use('/api', apiRoutes);

export default app;