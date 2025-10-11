import aiEngine from '../../core/engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class PatternRecognition {
  constructor() {
    this.engine = aiEngine;
    this.knownPatterns = [
      'singleton', 'factory', 'observer', 'strategy', 'decorator',
      'adapter', 'facade', 'proxy', 'mvc', 'mvvm'
    ];
  }

  async recognizePatterns(code, options = {}) {
    logger.info('Recognizing code patterns');

    const prompt = `Identify design patterns and coding patterns in this code:

\`\`\`
${code}
\`\`\`

Identify:
1. Design patterns used
2. Coding patterns and idioms
3. Anti-patterns
4. Best practices followed
5. Improvement suggestions`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.3
    });

    return {
      success: true,
      patterns: this.extractPatterns(response.content),
      antiPatterns: this.extractAntiPatterns(response.content),
      analysis: response.content
    };
  }

  extractPatterns(content) {
    const patterns = [];
    const lowerContent = content.toLowerCase();

    for (const pattern of this.knownPatterns) {
      if (lowerContent.includes(pattern)) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  extractAntiPatterns(content) {
    const antiPatterns = [];
    const antiPatternKeywords = ['anti-pattern', 'code smell', 'bad practice'];

    for (const keyword of antiPatternKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().includes(keyword)) {
            antiPatterns.push(line.trim());
          }
        }
      }
    }

    return antiPatterns;
  }

  async findSimilarCode(code, codebase, options = {}) {
    const prompt = `Find similar code patterns in the codebase:

Target Code:
\`\`\`
${code}
\`\`\`

Identify similar patterns, duplications, or refactoring opportunities.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.3
    });

    return {
      success: true,
      similarities: response.content
    };
  }
}

export default new PatternRecognition();
