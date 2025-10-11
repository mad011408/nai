import aiEngine from '../../core/engine/AIEngine.js';
import complexityAnalyzer from '../code-analysis/ComplexityAnalyzer.js';
import logger from '../../utils/logger.js';

export class PerformancePredictor {
  constructor() {
    this.engine = aiEngine;
    this.complexityAnalyzer = complexityAnalyzer;
  }

  async predict(code, options = {}) {
    logger.info('Predicting performance characteristics');

    const complexity = await this.complexityAnalyzer.analyze(code);
    const aiPrediction = await this.aiBasedPrediction(code, options);
    const bottlenecks = this.identifyBottlenecks(code);

    return {
      success: true,
      timeComplexity: aiPrediction.timeComplexity,
      spaceComplexity: aiPrediction.spaceComplexity,
      bottlenecks: bottlenecks,
      scalability: this.assessScalability(complexity, bottlenecks),
      recommendations: aiPrediction.recommendations
    };
  }

  async aiBasedPrediction(code, options) {
    const prompt = `Analyze the performance characteristics of this code:

\`\`\`
${code}
\`\`\`

Predict:
1. Time complexity (Big O notation)
2. Space complexity (Big O notation)
3. Performance bottlenecks
4. Scalability concerns
5. Optimization recommendations

Provide detailed analysis.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.3
    });

    return this.parsePrediction(response.content);
  }

  parsePrediction(content) {
    const timeComplexityMatch = content.match(/time.*?O\(([^)]+)\)/i);
    const spaceComplexityMatch = content.match(/space.*?O\(([^)]+)\)/i);

    return {
      timeComplexity: timeComplexityMatch ? `O(${timeComplexityMatch[1]})` : 'Unknown',
      spaceComplexity: spaceComplexityMatch ? `O(${spaceComplexityMatch[1]})` : 'Unknown',
      recommendations: this.extractRecommendations(content)
    };
  }

  identifyBottlenecks(code) {
    const bottlenecks = [];

    // Nested loops
    if (code.match(/for.*for|while.*while/s)) {
      bottlenecks.push({
        type: 'nested_loops',
        severity: 'high',
        description: 'Nested loops detected - potential O(n²) or worse'
      });
    }

    // Recursive calls without memoization
    if (code.match(/function.*\{[\s\S]*?\1\(/)) {
      bottlenecks.push({
        type: 'recursion',
        severity: 'medium',
        description: 'Recursive function - consider memoization'
      });
    }

    // Array operations in loops
    if (code.match(/for.*\.(push|concat|splice)/)) {
      bottlenecks.push({
        type: 'array_operations',
        severity: 'medium',
        description: 'Array operations in loop - consider pre-allocation'
      });
    }

    // Database queries in loops
    if (code.match(/for.*\.(query|find|execute)/)) {
      bottlenecks.push({
        type: 'n_plus_1',
        severity: 'critical',
        description: 'Database queries in loop - N+1 problem'
      });
    }

    return bottlenecks;
  }

  assessScalability(complexity, bottlenecks) {
    let score = 100;

    if (complexity.cyclomaticComplexity > 20) score -= 30;
    if (bottlenecks.some(b => b.severity === 'critical')) score -= 40;
    if (bottlenecks.some(b => b.severity === 'high')) score -= 20;

    return {
      score: Math.max(0, score),
      rating: this.getScalabilityRating(score)
    };
  }

  getScalabilityRating(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  extractRecommendations(content) {
    const recommendations = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.match(/recommend|optimize|improve|consider/i)) {
        recommendations.push(line.trim());
      }
    }

    return recommendations;
  }
}

export default new PerformancePredictor();
