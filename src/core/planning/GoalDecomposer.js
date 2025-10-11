import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class GoalDecomposer {
  constructor() {
    this.engine = aiEngine;
  }

  async decompose(goal, maxDepth = 3, options = {}) {
    logger.info('Decomposing goal');

    const decomposition = await this.decomposeRecursive(goal, 0, maxDepth, options);

    return {
      success: true,
      goal: goal,
      decomposition: decomposition,
      totalSubgoals: this.countSubgoals(decomposition)
    };
  }

  async decomposeRecursive(goal, depth, maxDepth, options) {
    if (depth >= maxDepth) {
      return { goal, subgoals: [], depth };
    }

    const prompt = `Break down this goal into 3-5 smaller subgoals:

Goal: ${goal}

Provide clear, actionable subgoals.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.5
    });

    const subgoals = this.extractSubgoals(response.content);
    const decomposedSubgoals = [];

    for (const subgoal of subgoals.slice(0, 3)) {
      const decomposed = await this.decomposeRecursive(
        subgoal,
        depth + 1,
        maxDepth,
        options
      );
      decomposedSubgoals.push(decomposed);
    }

    return {
      goal,
      subgoals: decomposedSubgoals,
      depth
    };
  }

  extractSubgoals(content) {
    const subgoals = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^\d+\.\s+(.+)$/);
      if (match) {
        subgoals.push(match[1].trim());
      }
    }

    return subgoals;
  }

  countSubgoals(decomposition) {
    let count = decomposition.subgoals.length;
    
    for (const subgoal of decomposition.subgoals) {
      count += this.countSubgoals(subgoal);
    }
    
    return count;
  }

  visualize(decomposition, indent = 0) {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}- ${decomposition.goal}`);
    
    for (const subgoal of decomposition.subgoals) {
      this.visualize(subgoal, indent + 1);
    }
  }
}

export default new GoalDecomposer();
