import logger from '../../utils/logger.js';

export class MemoryIndexer {
  constructor() {
    this.index = new Map();
    this.reverseIndex = new Map();
  }

  indexItem(id, content, metadata = {}) {
    // Tokenize content
    const tokens = this.tokenize(content);

    // Store in main index
    this.index.set(id, {
      content,
      tokens,
      metadata,
      timestamp: Date.now()
    });

    // Build reverse index
    tokens.forEach(token => {
      if (!this.reverseIndex.has(token)) {
        this.reverseIndex.set(token, new Set());
      }
      this.reverseIndex.get(token).add(id);
    });

    logger.info(`Indexed item: ${id}`);

    return { success: true, id, tokenCount: tokens.length };
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  search(query) {
    const queryTokens = this.tokenize(query);
    const results = new Map();

    // Find documents containing query tokens
    queryTokens.forEach(token => {
      const docIds = this.reverseIndex.get(token);
      if (docIds) {
        docIds.forEach(id => {
          results.set(id, (results.get(id) || 0) + 1);
        });
      }
    });

    // Sort by relevance (token match count)
    const sorted = Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({
        id,
        score,
        item: this.index.get(id)
      }));

    return {
      success: true,
      query,
      results: sorted,
      count: sorted.length
    };
  }

  getItem(id) {
    return this.index.get(id);
  }

  deleteItem(id) {
    const item = this.index.get(id);
    
    if (!item) return false;

    // Remove from reverse index
    item.tokens.forEach(token => {
      const docIds = this.reverseIndex.get(token);
      if (docIds) {
        docIds.delete(id);
        if (docIds.size === 0) {
          this.reverseIndex.delete(token);
        }
      }
    });

    // Remove from main index
    this.index.delete(id);

    logger.info(`Deleted item: ${id}`);
    return true;
  }

  clear() {
    this.index.clear();
    this.reverseIndex.clear();
    logger.info('Memory index cleared');
  }

  getStats() {
    return {
      totalItems: this.index.size,
      totalTokens: this.reverseIndex.size,
      averageTokensPerItem: this.index.size > 0 ?
        Array.from(this.index.values())
          .reduce((sum, item) => sum + item.tokens.length, 0) / this.index.size : 0
    };
  }

  rebuild() {
    logger.info('Rebuilding index');

    const items = Array.from(this.index.entries());
    this.clear();

    items.forEach(([id, item]) => {
      this.indexItem(id, item.content, item.metadata);
    });

    logger.info('Index rebuilt');
  }
}

export default new MemoryIndexer();
