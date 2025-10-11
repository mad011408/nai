import aiEngine from '../../core/engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class IntentPredictor {
  constructor() {
    this.engine = aiEngine;
  }

  async predictIntent(code, options = {}) {
    logger.info('Predicting code intent');

    const prompt = `Analyze this code and determine the developer's intent:

\`\`\`
${code}
\`\`\`

Determine:
1. Primary purpose
2. What problem it solves
3. Intended use cases
4. Design goals
5. Potential improvements aligned with intent`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.4
    });

    return {
      success: true,
      intent: this.parseIntent(response.content),
      confidence: 0.85
    };
  }

  async predictUserIntent(query, options = {}) {
    const prompt = `Analyze this user query and determine their intent:

Query: "${query}"

Classify intent as one of:
- code_generation
- code_explanation
- debugging
- optimization
- refactoring
- learning
- other

Provide classification and confidence score.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.3
    });

    return {
      success: true,
      intent: this.extractIntentType(response.content),
      details: response.content
    };
  }

  parseIntent(content) {
    return {
      purpose: this.extractSection(content, 'purpose|primary'),
      problem: this.extractSection(content, 'problem|solves'),
      useCases: this.extractSection(content, 'use case'),
      goals: this.extractSection(content, 'goal|design')
    };
  }

  extractSection(content, keywords) {
    const regex = new RegExp(`(${keywords})[:\\s]+(.*?)(?=\\n\\n|\\d+\\.|$)`, 'is');
    const match = content.match(regex);
    return match ? match[2].trim() : '';
  }

  extractIntentType(content) {
    const types = [
      'code_generation',
      'code_explanation',
      'debugging',
      'optimization',
      'refactoring',
      'learning'
    ];

    for (const type of types) {
      if (content.toLowerCase().includes(type.replace('_', ' '))) {
        return type;
      }
    }

    return 'other';
  }
}

export default new IntentPredictor();
