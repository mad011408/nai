import logger from '../../utils/logger.js';

export class BatchProcessor {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.batchSize = 10;
    this.batchTimeout = 1000;
  }

  async addToQueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      
      if (!this.processing) {
        this.processBatch();
      }
    });
  }

  async processBatch() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    try {
      const batch = this.queue.splice(0, this.batchSize);
      logger.info(`Processing batch of ${batch.length} tasks`);

      const results = await Promise.allSettled(
        batch.map(item => this.processTask(item.task))
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batch[index].resolve(result.value);
        } else {
          batch[index].reject(result.reason);
        }
      });

    } catch (error) {
      logger.error('Batch processing error:', error);
    } finally {
      this.processing = false;
      
      if (this.queue.length > 0) {
        setTimeout(() => this.processBatch(), this.batchTimeout);
      }
    }
  }

  async processTask(task) {
    if (typeof task === 'function') {
      return await task();
    }
    return task;
  }

  getQueueSize() {
    return this.queue.length;
  }

  isProcessing() {
    return this.processing;
  }

  clearQueue() {
    this.queue = [];
  }
}

export default new BatchProcessor();
