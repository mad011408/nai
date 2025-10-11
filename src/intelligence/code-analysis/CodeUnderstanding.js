import aiEngine from '../../core/engine/AIEngine.js';
import astParser from './ASTParser.js';
import logger from '../../utils/logger.js';

export class CodeUnderstanding {
  constructor() {
    this.engine = aiEngine;
    this.parser = astParser;
  }

  async understand(code, options = {}) {
    try {
      logger.info('Analyzing code understanding');

      const structuralAnalysis = await this.analyzeStructure(code);
      const semanticAnalysis = await this.analyzeSemantics(code, options);
      const intentAnalysis = await this.analyzeIntent(code, options);

      return {
        success: true,
        structure: structuralAnalysis,
        semantics: semanticAnalysis,
        intent: intentAnalysis,
        summary: this.generateSummary(structuralAnalysis, semanticAnalysis, intentAnalysis)
      };
    } catch (error) {
      logger.error('Code understanding failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeStructure(code) {
    try {
      const parsed = this.parser.parse(code);
      
      return {
        functions: parsed.metadata.functions.length,
        classes: parsed.metadata.classes.length,
        imports: parsed.metadata.imports.length,
        exports: parsed.metadata.exports.length,
        variables: parsed.metadata.variables.length,
        complexity: parsed.metadata.complexity,
        linesOfCode: code.split('\n').length
      };
    } catch (error) {
      logger.warn('Structure analysis failed:', error);
      return {};
    }
  }

  async analyzeSemantics(code, options) {
    const prompt = `Analyze the semantics and meaning of this code:

\`\`\`
${code}
\`\`\`

Provide:
1. What the code does (high-level purpose)
2. Key algorithms or patterns used
3. Data flow and transformations
4. Side effects and state changes
5. Dependencies and external interactions`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      model: options.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.3
    });

    return this.parseSemanticResponse(response.content);
  }

  async analyzeIntent(code, options) {
    const prompt = `Determine the intent and purpose of this code:

\`\`\`
${code}
\`\`\`

Explain:
1. Developer's intended goal
2. Problem being solved
3. Design decisions made
4. Potential use cases`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.4
    });

    return response.content;
  }

  parseSemanticResponse(content) {
    return {
      purpose: this.extractSection(content, 'purpose|does'),
      algorithms: this.extractSection(content, 'algorithms|patterns'),
      dataFlow: this.extractSection(content, 'data flow'),
      sideEffects: this.extractSection(content, 'side effects'),
      dependencies: this.extractSection(content, 'dependencies')
    };
  }

  extractSection(content, keywords) {
    const regex = new RegExp(`(${keywords})[:\\s]+(.*?)(?=\\n\\n|\\d+\\.|$)`, 'is');
    const match = content.match(regex);
    return match ? match[2].trim() : '';
  }

  generateSummary(structure, semantics, intent) {
    return `Code contains ${structure.functions} functions and ${structure.classes} classes with complexity ${structure.complexity}. ${intent}`;
  }

  async explainCode(code, options = {}) {
    const prompt = `Explain this code in simple terms:

\`\`\`
${code}
\`\`\`

Provide a clear, beginner-friendly explanation of what this code does and how it works.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.5
    });

    return response.content;
  }

  async documentCode(code, options = {}) {
    const prompt = `Generate comprehensive documentation for this code:

\`\`\`
${code}
\`\`\`

Include:
- Function/class descriptions
- Parameter documentation
- Return value descriptions
- Usage examples
- Edge cases and notes`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'cerebras',
      temperature: 0.3
    });

    return response.content;
  }
}

export default new CodeUnderstanding();
