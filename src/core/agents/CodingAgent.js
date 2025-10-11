import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class CodingAgent {
  constructor() {
    this.engine = aiEngine;
    this.capabilities = [
      'code_generation',
      'code_completion',
      'code_analysis',
      'debugging',
      'refactoring',
      'optimization',
      'testing'
    ];
  }

  async executeTask(task, context = {}) {
    logger.info(`CodingAgent executing task: ${task.type}`);

    switch (task.type) {
      case 'generate':
        return await this.generateCode(task.description, task.language, context);
      
      case 'complete':
        return await this.completeCode(task.code, task.context, context);
      
      case 'analyze':
        return await this.analyzeCode(task.code, task.analysisType, context);
      
      case 'debug':
        return await this.debugCode(task.code, task.error, context);
      
      case 'refactor':
        return await this.refactorCode(task.code, task.instructions, context);
      
      case 'optimize':
        return await this.optimizeCode(task.code, task.optimizationType, context);
      
      case 'test':
        return await this.generateTests(task.code, task.framework, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async generateCode(description, language = 'javascript', context = {}) {
    try {
      const response = await this.engine.generateCode(description, language, {
        provider: context.provider || 'cerebras',
        model: context.model || 'qwen-3-coder-480b',
        temperature: 0.4
      });

      return {
        success: true,
        code: this.extractCode(response.content),
        explanation: response.content,
        metadata: {
          provider: response.provider,
          model: response.model,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Code generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async completeCode(code, codeContext, options = {}) {
    try {
      const response = await this.engine.generateCodeCompletion(code, codeContext, options);
      
      return {
        success: true,
        completion: this.extractCode(response.content),
        fullResponse: response.content,
        metadata: {
          provider: response.provider,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Code completion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeCode(code, analysisType = 'full', options = {}) {
    try {
      const response = await this.engine.analyzeCode(code, analysisType, options);
      
      return {
        success: true,
        analysis: response.content,
        issues: this.extractIssues(response.content),
        suggestions: this.extractSuggestions(response.content),
        metadata: {
          provider: response.provider,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Code analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async debugCode(code, error, options = {}) {
    try {
      const response = await this.engine.debugCode(code, error, options);
      
      return {
        success: true,
        fix: this.extractCode(response.content),
        explanation: response.content,
        metadata: {
          provider: response.provider,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Code debugging failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async refactorCode(code, instructions, options = {}) {
    try {
      const response = await this.engine.refactorCode(code, instructions, options);
      
      return {
        success: true,
        refactoredCode: this.extractCode(response.content),
        changes: response.content,
        metadata: {
          provider: response.provider,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Code refactoring failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async optimizeCode(code, optimizationType = 'performance', options = {}) {
    try {
      const response = await this.engine.optimizeCode(code, optimizationType, options);
      
      return {
        success: true,
        optimizedCode: this.extractCode(response.content),
        improvements: response.content,
        metadata: {
          provider: response.provider,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Code optimization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateTests(code, framework = 'jest', options = {}) {
    try {
      const prompt = `Generate comprehensive unit tests for the following code using ${framework}:\n\n${code}\n\nInclude edge cases and error scenarios.`;
      const response = await this.engine.generateResponse(prompt, {
        ...options,
        temperature: 0.3
      });
      
      return {
        success: true,
        tests: this.extractCode(response.content),
        coverage: response.content,
        metadata: {
          provider: response.provider,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Test generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractCode(content) {
    // Extract code from markdown code blocks
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      return matches.map(m => m[1].trim()).join('\n\n');
    }
    
    return content;
  }

  extractIssues(content) {
    // Simple extraction - can be enhanced with NLP
    const issuePatterns = [
      /issue[s]?:?\s*(.*)/gi,
      /problem[s]?:?\s*(.*)/gi,
      /bug[s]?:?\s*(.*)/gi,
      /vulnerability:?\s*(.*)/gi
    ];
    
    const issues = [];
    for (const pattern of issuePatterns) {
      const matches = [...content.matchAll(pattern)];
      issues.push(...matches.map(m => m[1].trim()));
    }
    
    return issues;
  }

  extractSuggestions(content) {
    // Simple extraction
    const suggestionPatterns = [
      /suggestion[s]?:?\s*(.*)/gi,
      /recommend[ation]*[s]?:?\s*(.*)/gi,
      /should:?\s*(.*)/gi
    ];
    
    const suggestions = [];
    for (const pattern of suggestionPatterns) {
      const matches = [...content.matchAll(pattern)];
      suggestions.push(...matches.map(m => m[1].trim()));
    }
    
    return suggestions;
  }

  getCapabilities() {
    return this.capabilities;
  }
}

export default new CodingAgent();
