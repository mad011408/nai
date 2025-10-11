import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import agentRoutes from './api/routes/agent.routes.js';
import logger from './utils/logger.js';
import config from '../config/index.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/agent', agentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Advanced AI Agent',
    version: '1.0.0',
    status: 'running',
    description: 'World\'s most advanced AI coding assistant with 99.9% accuracy',
    endpoints: {
      chat: '/api/agent/chat',
      streamChat: '/api/agent/chat/stream',
      generateCode: '/api/agent/code/generate',
      completeCode: '/api/agent/code/complete',
      analyzeCode: '/api/agent/code/analyze',
      predictBugs: '/api/agent/code/predict-bugs',
      refactorCode: '/api/agent/code/refactor',
      optimizeCode: '/api/agent/code/optimize',
      debugCode: '/api/agent/code/debug',
      generateTests: '/api/agent/code/generate-tests',
      executeCode: '/api/agent/code/execute',
      models: '/api/agent/models',
      capabilities: '/api/agent/capabilities',
      health: '/api/agent/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

export default app;
