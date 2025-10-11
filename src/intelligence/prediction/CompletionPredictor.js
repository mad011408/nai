import aiEngine from '../../core/engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class CompletionPredictor {
  constructor() {
    this.engine = aiEngine;
  }

  async predictCompletion(partialCode, context = '', options = {}) {
    logger.info('Predicting code completion');

    const prompt = `Complete this code intelligently:

${partialCode}

Context: ${context}

Provide the most likely completion based on context and best practices.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'cerebras',
      model: options.model || 'qwen-3-coder-480b',
      temperature: 0.3,
      maxTokens: 2000
    });

    return {
      success: true,
      completion: response.content,
      confidence: this.estimateConfidence(partialCode, response.content)
    };
  }

  async predictNextLine(code, options = {}) {
    const lines = code.split('\n');
    const lastLine = lines[lines.length - 1];

    const prompt = `Given this code, predict the next line:

\`\`\`
${code}
\`\`\`

Provide only the next line that logically follows.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'cerebras',
      temperature: 0.2
    });

    return {
      success: true,
      nextLine: response.content.trim()
    };
  }

  async suggestVariableName(context, type, options = {}) {
    const prompt = `Suggest a good variable name for this context:

Context: ${context}
Type: ${type}

Provide 3-5 suggestions following naming conventions.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.5
    });

    return {
      success: true,
      suggestions: this.extractSuggestions(response.content)
    };
  }

  estimateConfidence(input, output) {
    const inputLength = input.length;
    const outputLength = output.length;

    // Simple heuristic: longer, more specific input = higher confidence
    let confidence = 0.5;

    if (inputLength > 100) confidence += 0.2;
    if (outputLength > 50 && outputLength < 500) confidence += 0.2;
    if (output.includes('function') || output.includes('const')) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  extractSuggestions(content) {
    const suggestions = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^\d+\.\s*`?(\w+)`?/);
      if (match) {
        suggestions.push(match[1]);
      }
    }

    return suggestions.slice(0, 5);
  }
}

export default new CompletionPredictor();
