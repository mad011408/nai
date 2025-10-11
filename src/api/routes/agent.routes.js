import express from 'express';
import AgentController from '../controllers/AgentController.js';

const router = express.Router();

// Chat with agent
router.post('/chat', AgentController.chat);

// Stream chat
router.post('/chat/stream', AgentController.streamChat);

// Code generation
router.post('/code/generate', AgentController.generateCode);

// Code completion
router.post('/code/complete', AgentController.completeCode);

// Code analysis
router.post('/code/analyze', AgentController.analyzeCode);

// Bug prediction
router.post('/code/predict-bugs', AgentController.predictBugs);

// Code refactoring
router.post('/code/refactor', AgentController.refactorCode);

// Code optimization
router.post('/code/optimize', AgentController.optimizeCode);

// Debug code
router.post('/code/debug', AgentController.debugCode);

// Generate tests
router.post('/code/generate-tests', AgentController.generateTests);

// Execute code
router.post('/code/execute', AgentController.executeCode);

// Get available models
router.get('/models', AgentController.getModels);

// Get agent capabilities
router.get('/capabilities', AgentController.getCapabilities);

// Health check
router.get('/health', AgentController.health);

export default router;
