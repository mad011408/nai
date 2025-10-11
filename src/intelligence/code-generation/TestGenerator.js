import aiEngine from '../../core/engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class TestGenerator {
  constructor() {
    this.engine = aiEngine;
    this.frameworks = {
      jest: 'Jest',
      mocha: 'Mocha',
      jasmine: 'Jasmine',
      pytest: 'Pytest',
      junit: 'JUnit'
    };
  }

  async generate(code, framework = 'jest', options = {}) {
    logger.info(`Generating ${framework} tests`);

    const prompt = this.buildPrompt(code, framework);

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'cerebras',
      model: options.model || 'qwen-3-coder-480b',
      temperature: 0.3
    });

    const tests = this.extractCode(response.content);

    return {
      success: true,
      tests: tests,
      framework: framework,
      testCases: this.extractTestCases(tests),
      coverage: this.estimateCoverage(code, tests)
    };
  }

  buildPrompt(code, framework) {
    return `Generate comprehensive ${framework} unit tests for this code:

\`\`\`
${code}
\`\`\`

Requirements:
1. Test all functions/methods
2. Include edge cases
3. Test error scenarios
4. Mock external dependencies
5. Aim for high coverage
6. Follow ${framework} best practices

Provide complete test suite with setup and teardown if needed.`;
  }

  async generateE2ETests(feature, framework = 'playwright', options = {}) {
    const prompt = `Generate end-to-end tests for this feature:

Feature: ${feature}

Framework: ${framework}

Include:
1. User flow tests
2. Integration tests
3. Error handling tests
4. Performance tests`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'cerebras',
      temperature: 0.3
    });

    return {
      success: true,
      tests: this.extractCode(response.content)
    };
  }

  async generateTestData(schema, count = 10, options = {}) {
    const prompt = `Generate ${count} test data samples for this schema:

${JSON.stringify(schema, null, 2)}

Provide diverse, realistic test data including edge cases.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.7
    });

    return {
      success: true,
      testData: this.parseTestData(response.content)
    };
  }

  extractCode(content) {
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : content;
  }

  extractTestCases(tests) {
    const testCases = [];
    const testRegex = /(it|test)\(['"](.+?)['"]/g;
    let match;

    while ((match = testRegex.exec(tests)) !== null) {
      testCases.push(match[2]);
    }

    return testCases;
  }

  estimateCoverage(code, tests) {
    const codeFunctions = (code.match(/function\s+\w+|const\s+\w+\s*=/g) || []).length;
    const testCases = this.extractTestCases(tests).length;

    const coverage = codeFunctions > 0 ? Math.min(100, (testCases / codeFunctions) * 100) : 0;

    return {
      estimated: Math.round(coverage),
      functions: codeFunctions,
      testCases: testCases
    };
  }

  parseTestData(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.warn('Failed to parse test data');
    }
    return [];
  }
}

export default new TestGenerator();
