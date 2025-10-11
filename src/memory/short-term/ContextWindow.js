import logger from '../../utils/logger.js';

export class ContextWindow {
  constructor(maxTokens = 8000) {
    this.maxTokens = maxTokens;
    this.currentContext = [];
    this.tokenCount = 0;
  }

  addToContext(item) {
    const tokens = this.estimateTokens(item.content);
    
    // Remove old items if exceeding limit
    while (this.tokenCount + tokens > this.maxTokens && this.currentContext.length > 0) {
      const removed = this.currentContext.shift();
      this.tokenCount -= this.estimateTokens(removed.content);
    }

    this.currentContext.push(item);
    this.tokenCount += tokens;

    logger.info(`Context updated: ${this.currentContext.length} items, ${this.tokenCount} tokens`);
  }

  getContext() {
    return this.currentContext;
  }

  getRecentContext(count = 5) {
    return this.currentContext.slice(-count);
  }

  clearContext() {
    this.currentContext = [];
    this.tokenCount = 0;
    logger.info('Context cleared');
  }

  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  getStats() {
    return {
      items: this.currentContext.length,
      tokens: this.tokenCount,
      maxTokens: this.maxTokens,
      utilization: (this.tokenCount / this.maxTokens) * 100
    };
  }

  compress() {
    // Keep only essential information
    const compressed = this.currentContext.map(item => ({
      role: item.role,
      content: item.content.substring(0, 500) // Limit to 500 chars
    }));

    this.currentContext = compressed;
    this.tokenCount = compressed.reduce((sum, item) => 
      sum + this.estimateTokens(item.content), 0
    );

    logger.info('Context compressed');
  }
}

export default new ContextWindow();
