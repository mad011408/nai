import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class StrategySelector {
  constructor() {
    this.engine = aiEngine;
  }

  async selectStrategy(problem, context = {}, options = {}) {
    logger.info('Selecting strategy');

    const strategies = await this.generateStrategies(problem, context, options);
    const evaluation = await this.evaluateStrategies(strategies, context, options);
    const selected = this.rankStrategies(evaluation);

    return {
      success: true,
      problem: problem,
      strategies: strategies,
      evaluation: evaluation,
      recommended: selected[0]
    };
  }

  async generateStrategies(problem, context, options) {
    const prompt = `Generate 3-5 different strategies to solve this problem:

Problem: ${problem}

Context:
${JSON.stringify(context, null, 2)}

For each strategy, provide:
1. Name
2. Description
3. Key steps
4. Pros and cons`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.7
    });

    return this.parseStrategies(response.content);
  }

  async evaluateStrategies(strategies, context, options) {
    const evaluations = [];

    for (const strategy of strategies) {
      const prompt = `Evaluate this strategy:

Strategy: ${strategy.name}
Description: ${strategy.description}

Rate (0-10) on:
1. Effectiveness
2. Feasibility
3. Risk level
4. Resource requirements
5. Time to completion

Provide scores and justification.`;

      const response = await this.engine.generateResponse(prompt, {
        provider: options.provider || 'nvidia',
        temperature: 0.3
      });

      evaluations.push({
        strategy: strategy,
        scores: this.extractScores(response.content),
        justification: response.content
      });
    }

    return evaluations;
  }

  rankStrategies(evaluations) {
    return evaluations.sort((a, b) => {
      const scoreA = Object.values(a.scores).reduce((sum, val) => sum + val, 0);
      const scoreB = Object.values(b.scores).reduce((sum, val) => sum + val, 0);
      return scoreB - scoreA;
    });
  }

  parseStrategies(content) {
    const strategies = [];
    const sections = content.split(/\d+\.\s+/);

    for (const section of sections.slice(1)) {
      const lines = section.split('\n');
      strategies.push({
        name: lines[0].trim(),
        description: section
      });
    }

    return strategies;
  }

  extractScores(content) {
    const scores = {};
    const scoreRegex = /(\w+):\s*(\d+)/g;
    let match;

    while ((match = scoreRegex.exec(content)) !== null) {
      scores[match[1].toLowerCase()] = parseInt(match[2]);
    }

    return scores;
  }
}

export default new StrategySelector();
