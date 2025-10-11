import modelOrchestrator from './ModelOrchestrator.js';
import logger from '../../utils/logger.js';
import NodeCache from 'node-cache';

export class AIEngine {
  constructor() {
    this.orchestrator = modelOrchestrator;
    this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
    this.requestQueue = [];
    this.processing = false;
  }

  async generateResponse(prompt, options = {}) {
    try {
      const cacheKey = this.getCacheKey(prompt, options);
      
      // Check cache
      if (options.useCache !== false) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          logger.info('Response served from cache');
          return { ...cached, fromCache: true };
        }
      }

      const messages = this.formatMessages(prompt, options.context);
      const response = await this.orchestrator.chat(messages, options);

      // Cache response
      if (options.useCache !== false) {
        this.cache.set(cacheKey, response);
      }

      return response;
    } catch (error) {
      logger.error('Generate response failed:', error);
      throw error;
    }
  }

  async generateStreamResponse(prompt, options = {}, onChunk) {
    try {
      const messages = this.formatMessages(prompt, options.context);
      return await this.orchestrator.streamChat(messages, options, onChunk);
    } catch (error) {
      logger.error('Generate stream response failed:', error);
      throw error;
    }
  }

  async generateCodeCompletion(code, context, options = {}) {
    const prompt = this.buildCodeCompletionPrompt(code, context);
    return await this.generateResponse(prompt, {
      ...options,
      temperature: 0.2, // Lower temperature for code
      model: options.model || 'qwen-3-coder-480b',
      provider: options.provider || 'cerebras'
    });
  }

  async analyzeCode(code, analysisType = 'full', options = {}) {
    const prompt = this.buildCodeAnalysisPrompt(code, analysisType);
    return await this.generateResponse(prompt, {
      ...options,
      temperature: 0.3,
      model: options.model || 'deepseek-ai/deepseek-v3.1'
    });
  }

  async generateCode(description, language, options = {}) {
    const prompt = this.buildCodeGenerationPrompt(description, language);
    return await this.generateResponse(prompt, {
      ...options,
      temperature: 0.4,
      provider: 'cerebras',
      model: 'qwen-3-coder-480b'
    });
  }

  async refactorCode(code, instructions, options = {}) {
    const prompt = `Refactor the following code based on these instructions: ${instructions}\n\nCode:\n${code}\n\nProvide the refactored code with explanations.`;
    return await this.generateResponse(prompt, {
      ...options,
      temperature: 0.3
    });
  }

  async debugCode(code, error, options = {}) {
    const prompt = `Debug this code that's producing the following error:\n\nError: ${error}\n\nCode:\n${code}\n\nProvide the fix and explanation.`;
    return await this.generateResponse(prompt, {
      ...options,
      temperature: 0.3
    });
  }

  async optimizeCode(code, optimizationType = 'performance', options = {}) {
    const prompt = `Optimize the following code for ${optimizationType}:\n\n${code}\n\nProvide optimized code with explanations.`;
    return await this.generateResponse(prompt, {
      ...options,
      temperature: 0.3
    });
  }

  formatMessages(prompt, context = []) {
    const messages = [];
    
    // Add system message
    messages.push({
      role: 'system',
      content: 'You are an advanced AI coding assistant with 99.9% accuracy. You provide fast, accurate, and production-ready code solutions.'
    });

    // Add context messages
    if (context && context.length > 0) {
      messages.push(...context);
    }

    // Add user prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    return messages;
  }

  buildCodeCompletionPrompt(code, context) {
    return `Complete the following code:\n\n${code}\n\nContext: ${context}\n\nProvide only the completion, no explanations.`;
  }

  buildCodeAnalysisPrompt(code, analysisType) {
    const analysisTypes = {
      full: 'Perform a comprehensive analysis including complexity, security, performance, and best practices.',
      security: 'Analyze for security vulnerabilities and potential exploits.',
      performance: 'Analyze for performance bottlenecks and optimization opportunities.',
      quality: 'Analyze code quality, maintainability, and adherence to best practices.'
    };

    return `${analysisTypes[analysisType] || analysisTypes.full}\n\nCode:\n${code}`;
  }

  buildCodeGenerationPrompt(description, language) {
    return `Generate ${language} code for the following requirement:\n\n${description}\n\nProvide production-ready, well-documented code with error handling.`;
  }

  getCacheKey(prompt, options) {
    return `${prompt}_${options.provider || 'default'}_${options.model || 'default'}`;
  }

  clearCache() {
    this.cache.flushAll();
    logger.info('Cache cleared');
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

export default new AIEngine();
