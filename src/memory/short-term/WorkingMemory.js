import logger from '../../utils/logger.js';

export class WorkingMemory {
  constructor() {
    this.memory = new Map();
    this.maxSize = 100;
  }

  store(key, value, ttl = 3600000) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0
    };

    this.memory.set(key, item);

    // Cleanup old items
    if (this.memory.size > this.maxSize) {
      this.cleanup();
    }

    logger.info(`Stored in working memory: ${key}`);
  }

  retrieve(key) {
    const item = this.memory.get(key);

    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.memory.delete(key);
      return null;
    }

    item.accessCount++;
    return item.value;
  }

  has(key) {
    return this.memory.has(key) && this.retrieve(key) !== null;
  }

  delete(key) {
    this.memory.delete(key);
    logger.info(`Deleted from working memory: ${key}`);
  }

  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, item] of this.memory.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memory.delete(key);
        removed++;
      }
    }

    // If still too large, remove least accessed
    if (this.memory.size > this.maxSize) {
      const sorted = Array.from(this.memory.entries())
        .sort((a, b) => a[1].accessCount - b[1].accessCount);

      const toRemove = sorted.slice(0, this.memory.size - this.maxSize);
      toRemove.forEach(([key]) => this.memory.delete(key));
      removed += toRemove.length;
    }

    if (removed > 0) {
      logger.info(`Cleaned up ${removed} items from working memory`);
    }
  }

  clear() {
    this.memory.clear();
    logger.info('Working memory cleared');
  }

  getStats() {
    return {
      size: this.memory.size,
      maxSize: this.maxSize,
      keys: Array.from(this.memory.keys())
    };
  }

  getAll() {
    const result = {};
    for (const [key, item] of this.memory.entries()) {
      result[key] = item.value;
    }
    return result;
  }
}

export default new WorkingMemory();
