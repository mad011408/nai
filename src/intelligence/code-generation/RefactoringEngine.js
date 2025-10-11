import aiEngine from '../../core/engine/AIEngine.js';
import astParser from '../code-analysis/ASTParser.js';
import logger from '../../utils/logger.js';

export class RefactoringEngine {
  constructor() {
    this.engine = aiEngine;
    this.parser = astParser;
  }

  async refactor(code, instructions, options = {}) {
    try {
      logger.info('Starting code refactoring');

      const analysis = await this.analyzeRefactoringNeeds(code);
      const refactored = await this.performRefactoring(code, instructions, options);
      const validation = await this.validateRefactoring(code, refactored.code);

      return {
        success: true,
        originalCode: code,
        refactoredCode: refactored.code,
        changes: refactored.changes,
        improvements: analysis.improvements,
        validation: validation
      };
    } catch (error) {
      logger.error('Refactoring failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeRefactoringNeeds(code) {
    try {
      const parsed = this.parser.parse(code);
      const improvements = [];

      if (parsed.metadata.complexity > 10) {
        improvements.push({
          type: 'complexity',
          message: 'High complexity - consider breaking into smaller functions',
          priority: 'high'
        });
      }

      if (parsed.metadata.functions.some(f => f.params.length > 5)) {
        improvements.push({
          type: 'parameters',
          message: 'Functions with too many parameters - consider using objects',
          priority: 'medium'
        });
      }

      return { improvements };
    } catch (error) {
      return { improvements: [] };
    }
  }

  async performRefactoring(code, instructions, options) {
    const prompt = `Refactor this code according to the following instructions:

Instructions: ${instructions}

Original Code:
\`\`\`
${code}
\`\`\`

Provide:
1. Refactored code
2. List of changes made
3. Explanation of improvements

Follow best practices:
- Maintain functionality
- Improve readability
- Reduce complexity
- Follow DRY principle
- Use meaningful names`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      model: options.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.3,
      maxTokens: 8000
    });

    return this.parseRefactoringResponse(response.content);
  }

  parseRefactoringResponse(content) {
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : content;

    const changesMatch = content.match(/changes?[:\s]+([\s\S]*?)(?=\n\n|explanation|$)/i);
    const changes = changesMatch ? changesMatch[1].trim() : 'See refactored code';

    return { code, changes };
  }

  async validateRefactoring(originalCode, refactoredCode) {
    const prompt = `Compare these two code versions and validate the refactoring:

Original:
\`\`\`
${originalCode}
\`\`\`

Refactored:
\`\`\`
${refactoredCode}
\`\`\`

Verify:
1. Functionality preserved
2. No breaking changes
3. Improvements made
4. Potential issues`;

    const response = await this.engine.generateResponse(prompt, {
      temperature: 0.2
    });

    return {
      valid: !response.content.toLowerCase().includes('breaking change'),
      notes: response.content
    };
  }

  async extractFunction(code, functionName, options = {}) {
    const prompt = `Extract a reusable function named "${functionName}" from this code:

\`\`\`
${code}
\`\`\`

Provide the extracted function and the modified original code.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'cerebras',
      temperature: 0.3
    });

    return response.content;
  }

  async renameVariables(code, renamingMap, options = {}) {
    let refactoredCode = code;

    for (const [oldName, newName] of Object.entries(renamingMap)) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      refactoredCode = refactoredCode.replace(regex, newName);
    }

    return {
      success: true,
      code: refactoredCode,
      changes: Object.entries(renamingMap).map(([old, newName]) => 
        `Renamed ${old} to ${newName}`
      )
    };
  }

  async modernizeCode(code, targetVersion = 'ES2022', options = {}) {
    const prompt = `Modernize this code to ${targetVersion} standards:

\`\`\`
${code}
\`\`\`

Apply modern JavaScript features:
- Arrow functions
- Destructuring
- Template literals
- Async/await
- Optional chaining
- Nullish coalescing
- Modern array methods`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'cerebras',
      model: 'qwen-3-coder-480b',
      temperature: 0.3
    });

    const modernCode = this.extractCode(response.content);

    return {
      success: true,
      code: modernCode,
      explanation: response.content
    };
  }

  extractCode(content) {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      return matches.map(m => m[1].trim()).join('\n\n');
    }
    
    return content;
  }
}

export default new RefactoringEngine();
