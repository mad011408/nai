import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class TreeOfThought {
  constructor() {
    this.engine = aiEngine;
    this.maxDepth = 5;
    this.branchingFactor = 3;
  }

  async explore(problem, options = {}) {
    logger.info('Starting Tree of Thought exploration');

    const root = {
      id: 'root',
      thought: problem,
      depth: 0,
      children: [],
      score: 0
    };

    await this.expandNode(root, options);

    const bestPath = this.findBestPath(root);

    return {
      success: true,
      problem: problem,
      explorationTree: root,
      bestPath: bestPath,
      solution: bestPath[bestPath.length - 1].thought
    };
  }

  async expandNode(node, options, depth = 0) {
    if (depth >= this.maxDepth) return;

    const branches = await this.generateBranches(node.thought, options);

    for (let i = 0; i < Math.min(branches.length, this.branchingFactor); i++) {
      const branch = branches[i];
      const childNode = {
        id: `${node.id}_${i}`,
        thought: branch.thought,
        depth: depth + 1,
        children: [],
        score: branch.score,
        parent: node
      };

      node.children.push(childNode);

      if (depth < this.maxDepth - 1) {
        await this.expandNode(childNode, options, depth + 1);
      }
    }
  }

  async generateBranches(thought, options) {
    const prompt = `Generate ${this.branchingFactor} different reasoning paths from this thought:

Thought: ${thought}

For each path, provide:
1. The next logical step
2. A score (0-1) indicating promise of this direction

Format as JSON array.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      model: options.model || 'qwen/qwen3-next-80b-a3b-thinking',
      temperature: 0.8
    });

    return this.parseBranches(response.content);
  }

  parseBranches(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.warn('Failed to parse branches, using defaults');
    }

    return [
      { thought: 'Continue analysis', score: 0.5 },
      { thought: 'Alternative approach', score: 0.5 },
      { thought: 'Verify assumptions', score: 0.5 }
    ];
  }

  findBestPath(root) {
    const paths = [];
    this.collectPaths(root, [], paths);

    paths.sort((a, b) => {
      const scoreA = a.reduce((sum, node) => sum + node.score, 0) / a.length;
      const scoreB = b.reduce((sum, node) => sum + node.score, 0) / b.length;
      return scoreB - scoreA;
    });

    return paths[0] || [root];
  }

  collectPaths(node, currentPath, allPaths) {
    currentPath.push(node);

    if (node.children.length === 0) {
      allPaths.push([...currentPath]);
    } else {
      for (const child of node.children) {
        this.collectPaths(child, currentPath, allPaths);
      }
    }

    currentPath.pop();
  }

  visualizeTree(node, indent = 0) {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}- ${node.thought} (score: ${node.score})`);
    
    for (const child of node.children) {
      this.visualizeTree(child, indent + 1);
    }
  }
}

export default new TreeOfThought();
