import astParser from './ASTParser.js';
import logger from '../../utils/logger.js';

export class ComplexityAnalyzer {
  constructor() {
    this.parser = astParser;
  }

  async analyze(code, options = {}) {
    logger.info('Analyzing code complexity');

    try {
      const parsed = this.parser.parse(code);
      const cyclomaticComplexity = this.parser.analyzeComplexity(parsed.ast);
      const cognitiveComplexity = this.calculateCognitiveComplexity(code);
      const maintainabilityIndex = this.calculateMaintainabilityIndex(code, cyclomaticComplexity);

      return {
        success: true,
        cyclomaticComplexity: cyclomaticComplexity,
        cognitiveComplexity: cognitiveComplexity,
        maintainabilityIndex: maintainabilityIndex,
        rating: this.getRating(cyclomaticComplexity),
        recommendations: this.getRecommendations(cyclomaticComplexity, cognitiveComplexity)
      };
    } catch (error) {
      logger.error('Complexity analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateCognitiveComplexity(code) {
    let complexity = 0;
    const lines = code.split('\n');

    for (const line of lines) {
      // Nested conditions increase complexity
      if (line.match(/if|for|while|switch/)) complexity++;
      if (line.match(/&&|\|\|/)) complexity++;
      if (line.match(/\?.*:/)) complexity++; // Ternary
      if (line.match(/catch/)) complexity++;
    }

    return complexity;
  }

  calculateMaintainabilityIndex(code, complexity) {
    const linesOfCode = code.split('\n').length;
    const halsteadVolume = this.calculateHalsteadVolume(code);
    
    // Maintainability Index formula (simplified)
    const mi = Math.max(0, 
      (171 - 5.2 * Math.log(halsteadVolume) - 0.23 * complexity - 16.2 * Math.log(linesOfCode)) * 100 / 171
    );

    return Math.round(mi);
  }

  calculateHalsteadVolume(code) {
    const operators = code.match(/[+\-*/%=<>!&|^~?:]/g) || [];
    const operands = code.match(/\b\w+\b/g) || [];
    
    const n1 = new Set(operators).size;
    const n2 = new Set(operands).size;
    const N1 = operators.length;
    const N2 = operands.length;

    const vocabulary = n1 + n2;
    const length = N1 + N2;

    return length * Math.log2(vocabulary || 1);
  }

  getRating(complexity) {
    if (complexity <= 5) return 'A - Low complexity';
    if (complexity <= 10) return 'B - Moderate complexity';
    if (complexity <= 20) return 'C - High complexity';
    if (complexity <= 30) return 'D - Very high complexity';
    return 'F - Extremely high complexity';
  }

  getRecommendations(cyclomatic, cognitive) {
    const recommendations = [];

    if (cyclomatic > 10) {
      recommendations.push('Break down into smaller functions');
    }

    if (cognitive > 15) {
      recommendations.push('Reduce nesting depth');
      recommendations.push('Simplify conditional logic');
    }

    if (cyclomatic > 20) {
      recommendations.push('Consider refactoring - complexity is too high');
    }

    return recommendations;
  }
}

export default new ComplexityAnalyzer();
