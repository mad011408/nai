import logger from '../../utils/logger.js';

export class VectorDatabase {
  constructor() {
    this.vectors = new Map();
    this.metadata = new Map();
  }

  async store(id, vector, metadata = {}) {
    if (!Array.isArray(vector)) {
      throw new Error('Vector must be an array');
    }

    this.vectors.set(id, vector);
    this.metadata.set(id, {
      ...metadata,
      timestamp: Date.now()
    });

    logger.info(`Stored vector: ${id}`);

    return { success: true, id };
  }

  async retrieve(id) {
    const vector = this.vectors.get(id);
    const metadata = this.metadata.get(id);

    if (!vector) return null;

    return {
      id,
      vector,
      metadata
    };
  }

  async search(queryVector, topK = 5) {
    const results = [];

    for (const [id, vector] of this.vectors.entries()) {
      const similarity = this.cosineSimilarity(queryVector, vector);
      results.push({
        id,
        similarity,
        vector,
        metadata: this.metadata.get(id)
      });
    }

    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK);
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async delete(id) {
    this.vectors.delete(id);
    this.metadata.delete(id);
    logger.info(`Deleted vector: ${id}`);
  }

  async clear() {
    this.vectors.clear();
    this.metadata.clear();
    logger.info('Vector database cleared');
  }

  getStats() {
    return {
      totalVectors: this.vectors.size,
      dimensions: this.vectors.size > 0 ? 
        Array.from(this.vectors.values())[0].length : 0
    };
  }

  async bulkStore(items) {
    const results = [];

    for (const item of items) {
      const result = await this.store(item.id, item.vector, item.metadata);
      results.push(result);
    }

    return results;
  }
}

export default new VectorDatabase();
