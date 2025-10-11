import vectorDatabase from '../long-term/VectorDatabase.js';
import logger from '../../utils/logger.js';

export class SemanticRetriever {
  constructor() {
    this.vectorDB = vectorDatabase;
  }

  async retrieve(query, options = {}) {
    logger.info('Semantic retrieval started');

    const queryVector = this.textToVector(query);
    const results = await this.vectorDB.search(queryVector, options.topK || 10);

    // Filter by minimum similarity
    const minSimilarity = options.minSimilarity || 0.5;
    const filtered = results.filter(r => r.similarity >= minSimilarity);

    return {
      success: true,
      query,
      results: filtered,
      count: filtered.length
    };
  }

  textToVector(text) {
    // Simple vectorization (placeholder)
    const vector = new Array(384).fill(0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = charCode % 384;
      vector[index] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / (magnitude || 1));
  }

  async findSimilar(documentId, options = {}) {
    const document = await this.vectorDB.retrieve(documentId);
    
    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    const similar = await this.vectorDB.search(document.vector, options.topK || 5);

    // Remove the query document itself
    const filtered = similar.filter(r => r.id !== documentId);

    return {
      success: true,
      documentId,
      similar: filtered
    };
  }

  async cluster(documents, numClusters = 5) {
    // Simple k-means clustering
    logger.info(`Clustering ${documents.length} documents into ${numClusters} clusters`);

    // Initialize centroids randomly
    const centroids = documents
      .sort(() => Math.random() - 0.5)
      .slice(0, numClusters)
      .map(d => d.vector);

    const clusters = new Array(numClusters).fill(null).map(() => []);

    // Assign documents to nearest centroid
    for (const doc of documents) {
      let minDist = Infinity;
      let clusterIdx = 0;

      for (let i = 0; i < centroids.length; i++) {
        const dist = this.euclideanDistance(doc.vector, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = i;
        }
      }

      clusters[clusterIdx].push(doc);
    }

    return {
      success: true,
      clusters: clusters.map((cluster, idx) => ({
        id: idx,
        size: cluster.length,
        documents: cluster
      }))
    };
  }

  euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }
}

export default new SemanticRetriever();
