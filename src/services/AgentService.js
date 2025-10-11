import codingAgent from '../core/agents/CodingAgent.js';
import aiEngine from '../core/engine/AIEngine.js';
import bugPredictor from '../intelligence/prediction/BugPredictor.js';
import codeGenerator from '../intelligence/code-generation/CodeGenerator.js';
import refactoringEngine from '../intelligence/code-generation/RefactoringEngine.js';
import conversationMemory from '../memory/short-term/ConversationMemory.js';
import logger from '../utils/logger.js';

export class AgentService {
  constructor() {
    this.agent = codingAgent;
    this.engine = aiEngine;
  }

  async processRequest(request) {
    try {
      const { type, data, options } = request;

      logger.info(`Processing request: ${type}`);

      switch (type) {
        case 'chat':
          return await this.handleChat(data, options);
        
        case 'code_generation':
          return await this.handleCodeGeneration(data, options);
        
        case 'code_analysis':
          return await this.handleCodeAnalysis(data, options);
        
        case 'bug_prediction':
          return await this.handleBugPrediction(data, options);
        
        case 'refactoring':
          return await this.handleRefactoring(data, options);
        
        case 'optimization':
          return await this.handleOptimization(data, options);
        
        default:
          throw new Error(`Unknown request type: ${type}`);
      }
    } catch (error) {
      logger.error('Request processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleChat(data, options) {
    const { message, conversationId } = data;
    
    const convId = conversationId || `conv_${Date.now()}`;
    const history = conversationMemory.getFormattedHistory(convId, 10);

    const response = await this.engine.generateResponse(message, {
      context: history,
      ...options
    });

    conversationMemory.addMessage(convId, { role: 'user', content: message });
    conversationMemory.addMessage(convId, { role: 'assistant', content: response.content });

    return {
      success: true,
      conversationId: convId,
      response: response.content,
      metadata: response
    };
  }

  async handleCodeGeneration(data, options) {
    const { description, language, framework } = data;

    const result = await codeGenerator.generate(description, {
      language: language || 'javascript',
      framework,
      ...options
    });

    return result;
  }

  async handleCodeAnalysis(data, options) {
    const { code, analysisType } = data;

    const result = await this.agent.analyzeCode(code, analysisType || 'full', options);

    return result;
  }

  async handleBugPrediction(data, options) {
    const { code } = data;

    const result = await bugPredictor.predict(code, options);

    return result;
  }

  async handleRefactoring(data, options) {
    const { code, instructions } = data;

    const result = await refactoringEngine.refactor(code, instructions, options);

    return result;
  }

  async handleOptimization(data, options) {
    const { code, optimizationType } = data;

    const result = await this.agent.optimizeCode(code, optimizationType || 'performance', options);

    return result;
  }

  async batchProcess(requests, options = {}) {
    const results = [];

    for (const request of requests) {
      const result = await this.processRequest(request);
      results.push(result);

      if (!result.success && options.stopOnError) {
        break;
      }
    }

    return {
      success: true,
      results,
      total: requests.length,
      successful: results.filter(r => r.success).length
    };
  }

  async getCapabilities() {
    return {
      chat: true,
      codeGeneration: true,
      codeCompletion: true,
      codeAnalysis: true,
      bugPrediction: true,
      refactoring: true,
      optimization: true,
      debugging: true,
      testGeneration: true,
      codeExecution: true,
      reasoning: true,
      planning: true
    };
  }

  async getStats() {
    return {
      cacheStats: this.engine.getCacheStats(),
      memoryStats: conversationMemory.getStats()
    };
  }
}

export default new AgentService();
