import aiEngine from '../../core/engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class OptimizationEngine {
  constructor() {
    this.engine = aiEngine;
  }

  async optimize(code, type = 'performance', options = {}) {
    logger.info(`Optimizing code for ${type}`);

    const strategies = this.getOptimizationStrategies(type);
    const optimized = await this.applyOptimizations(code, strategies, options);

    return {
      success: true,
      originalCode: code,
      optimizedCode: optimized.code,
      improvements: optimized.improvements,
      metrics: await this.compareMetrics(code, optimized.code)
    };
  }

  getOptimizationStrategies(type) {
    const strategies = {
      performance: [
        'Reduce time complexity',
        'Minimize loops',
        'Use efficient data structures',
        'Cache repeated calculations',
        'Avoid unnecessary operations'
      ],
      memory: [
        'Reduce memory allocation',
        'Reuse objects',
        'Clear unused references',
        'Use appropriate data structures',
        'Avoid memory leaks'
      ],
      readability: [
        'Improve naming',
        'Add comments',
        'Simplify logic',
        'Extract functions',
        'Follow conventions'
      ],
      security: [
        'Input validation',
        'Sanitize data',
        'Use secure functions',
        'Avoid vulnerabilities',
        'Implement proper error handling'
      ]
    };

    return strategies[type] || strategies.performance;
  }

  async applyOptimizations(code, strategies, options) {
    const prompt = `Optimize this code:

\`\`\`
${code}
\`\`\`

Optimization strategies:
${strategies.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Provide:
1. Optimized code
2. List of improvements made
3. Performance impact explanation`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      model: options.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.3
    });

    return {
      code: this.extractCode(response.content),
      improvements: this.extractImprovements(response.content)
    };
  }

  async compareMetrics(originalCode, optimizedCode) {
    return {
      originalLines: originalCode.split('\n').length,
      optimizedLines: optimizedCode.split('\n').length,
      reduction: this.calculateReduction(originalCode, optimizedCode)
    };
  }

  calculateReduction(original, optimized) {
    const originalSize = original.length;
    const optimizedSize = optimized.length;
    const reduction = ((originalSize - optimizedSize) / originalSize) * 100;
    return Math.round(reduction);
  }

  extractCode(content) {
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : content;
  }

  extractImprovements(content) {
    const improvements = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        improvements.push(line.trim());
      }
    }

    return improvements;
  }
}

export default new OptimizationEngine();
