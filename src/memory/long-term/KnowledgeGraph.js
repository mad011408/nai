import logger from '../../utils/logger.js';

export class KnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(id, data) {
    this.nodes.set(id, {
      id,
      data,
      timestamp: Date.now()
    });

    logger.info(`Node added: ${id}`);
    return { success: true, id };
  }

  addEdge(fromId, toId, relationship, weight = 1.0) {
    const edgeId = `${fromId}->${toId}`;
    
    this.edges.set(edgeId, {
      from: fromId,
      to: toId,
      relationship,
      weight,
      timestamp: Date.now()
    });

    logger.info(`Edge added: ${edgeId} (${relationship})`);
    return { success: true, edgeId };
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getNeighbors(nodeId) {
    const neighbors = [];

    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.from === nodeId) {
        const node = this.nodes.get(edge.to);
        if (node) {
          neighbors.push({
            node,
            relationship: edge.relationship,
            weight: edge.weight
          });
        }
      }
    }

    return neighbors;
  }

  findPath(startId, endId, maxDepth = 5) {
    const visited = new Set();
    const queue = [[startId]];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === endId) {
        return path;
      }

      if (path.length >= maxDepth) {
        continue;
      }

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        queue.push([...path, neighbor.node.id]);
      }
    }

    return null; // No path found
  }

  query(criteria) {
    const results = [];

    for (const [id, node] of this.nodes.entries()) {
      let matches = true;

      for (const [key, value] of Object.entries(criteria)) {
        if (node.data[key] !== value) {
          matches = false;
          break;
        }
      }

      if (matches) {
        results.push(node);
      }
    }

    return results;
  }

  deleteNode(id) {
    this.nodes.delete(id);

    // Delete associated edges
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.from === id || edge.to === id) {
        this.edges.delete(edgeId);
      }
    }

    logger.info(`Node deleted: ${id}`);
  }

  getStats() {
    return {
      nodes: this.nodes.size,
      edges: this.edges.size
    };
  }

  export() {
    return {
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries())
    };
  }

  import(data) {
    this.nodes = new Map(data.nodes);
    this.edges = new Map(data.edges);
    logger.info('Knowledge graph imported');
  }
}

export default new KnowledgeGraph();
