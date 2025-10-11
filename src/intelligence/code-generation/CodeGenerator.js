import aiEngine from '../../core/engine/AIEngine.js';
import logger from '../../utils/logger.js';
import prettier from 'prettier';

export class CodeGenerator {
  constructor() {
    this.engine = aiEngine;
    this.templates = new Map();
    this.loadTemplates();
  }

  loadTemplates() {
    // Load common code templates
    this.templates.set('express-api', {
      language: 'javascript',
      framework: 'express',
      template: 'REST API with Express.js'
    });
    
    this.templates.set('react-component', {
      language: 'jsx',
      framework: 'react',
      template: 'React functional component'
    });
  }

  async generate(specification, options = {}) {
    try {
      logger.info('Generating code from specification');

      const prompt = this.buildGenerationPrompt(specification, options);
      
      const response = await this.engine.generateResponse(prompt, {
        provider: options.provider || 'cerebras',
        model: options.model || 'qwen-3-coder-480b',
        temperature: 0.4,
        maxTokens: 8000
      });

      const code = this.extractCode(response.content);
      const formattedCode = await this.formatCode(code, options.language);

      return {
        success: true,
        code: formattedCode,
        rawResponse: response.content,
        metadata: {
          language: options.language,
          provider: response.provider,
          duration: response.duration
        }
      };
    } catch (error) {
      logger.error('Code generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateFromTemplate(templateName, variables, options = {}) {
    const template = this.templates.get(templateName);
    
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const specification = this.fillTemplate(template, variables);
    return await this.generate(specification, {
      ...options,
      language: template.language
    });
  }

  async generateFunction(functionSpec, options = {}) {
    const prompt = `Generate a ${options.language || 'JavaScript'} function with the following specification:

Name: ${functionSpec.name}
Description: ${functionSpec.description}
Parameters: ${JSON.stringify(functionSpec.parameters)}
Return Type: ${functionSpec.returnType || 'any'}

Requirements:
- Include JSDoc comments
- Add error handling
- Follow best practices
- Include input validation

Generate only the function code.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: 'cerebras',
      model: 'qwen-3-coder-480b',
      temperature: 0.3
    });

    return this.extractCode(response.content);
  }

  async generateClass(classSpec, options = {}) {
    const prompt = `Generate a ${options.language || 'JavaScript'} class with the following specification:

Name: ${classSpec.name}
Description: ${classSpec.description}
Properties: ${JSON.stringify(classSpec.properties)}
Methods: ${JSON.stringify(classSpec.methods)}

Requirements:
- Include JSDoc comments
- Add constructor
- Implement all methods
- Follow OOP best practices
- Add error handling

Generate the complete class.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: 'cerebras',
      model: 'qwen-3-coder-480b',
      temperature: 0.3
    });

    return this.extractCode(response.content);
  }

  async generateAPI(apiSpec, options = {}) {
    const prompt = `Generate a REST API with the following specification:

Framework: ${options.framework || 'Express.js'}
Endpoints: ${JSON.stringify(apiSpec.endpoints)}
Database: ${apiSpec.database || 'MongoDB'}
Authentication: ${apiSpec.auth || 'JWT'}

Requirements:
- Complete CRUD operations
- Error handling middleware
- Input validation
- Security best practices
- Proper routing structure

Generate the complete API code.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: 'cerebras',
      model: 'qwen-3-coder-480b',
      temperature: 0.4,
      maxTokens: 8000
    });

    return this.extractCode(response.content);
  }

  async generateTests(code, framework = 'jest', options = {}) {
    const prompt = `Generate comprehensive unit tests for the following code using ${framework}:

\`\`\`
${code}
\`\`\`

Requirements:
- Test all functions/methods
- Include edge cases
- Test error scenarios
- Mock external dependencies
- Achieve high coverage

Generate complete test suite.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: 'cerebras',
      model: 'qwen-3-coder-480b',
      temperature: 0.3
    });

    return this.extractCode(response.content);
  }

  buildGenerationPrompt(specification, options) {
    let prompt = `Generate ${options.language || 'JavaScript'} code for the following specification:\n\n`;
    prompt += `${specification}\n\n`;
    prompt += 'Requirements:\n';
    prompt += '- Production-ready code\n';
    prompt += '- Proper error handling\n';
    prompt += '- Clear documentation\n';
    prompt += '- Follow best practices\n';
    prompt += '- Optimize for performance\n';
    
    if (options.framework) {
      prompt += `- Use ${options.framework} framework\n`;
    }
    
    if (options.style) {
      prompt += `- Follow ${options.style} coding style\n`;
    }

    return prompt;
  }

  extractCode(content) {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      return matches.map(m => m[1].trim()).join('\n\n');
    }
    
    return content;
  }

  async formatCode(code, language = 'javascript') {
    try {
      const parser = this.getParser(language);
      return prettier.format(code, {
        parser: parser,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5'
      });
    } catch (error) {
      logger.warn('Code formatting failed, returning unformatted code');
      return code;
    }
  }

  getParser(language) {
    const parserMap = {
      javascript: 'babel',
      typescript: 'typescript',
      jsx: 'babel',
      tsx: 'typescript',
      json: 'json',
      html: 'html',
      css: 'css'
    };

    return parserMap[language] || 'babel';
  }

  fillTemplate(template, variables) {
    let spec = template.template;
    
    for (const [key, value] of Object.entries(variables)) {
      spec = spec.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return spec;
  }
}

export default new CodeGenerator();
