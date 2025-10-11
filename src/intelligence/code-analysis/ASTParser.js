import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as acorn from 'acorn';
import logger from '../../utils/logger.js';

export class ASTParser {
  constructor() {
    this.supportedLanguages = ['javascript', 'typescript', 'jsx', 'tsx'];
  }

  parse(code, language = 'javascript') {
    try {
      logger.info(`Parsing ${language} code`);

      if (language === 'javascript' || language === 'jsx') {
        return this.parseJavaScript(code, language);
      } else if (language === 'typescript' || language === 'tsx') {
        return this.parseTypeScript(code, language);
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }
    } catch (error) {
      logger.error('AST parsing failed:', error);
      throw error;
    }
  }

  parseJavaScript(code, language) {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'classProperties',
        'decorators-legacy',
        'dynamicImport',
        'objectRestSpread',
        'asyncGenerators'
      ]
    });

    return {
      ast,
      language,
      metadata: this.extractMetadata(ast)
    };
  }

  parseTypeScript(code, language) {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        'classProperties',
        'decorators-legacy',
        'dynamicImport'
      ]
    });

    return {
      ast,
      language,
      metadata: this.extractMetadata(ast)
    };
  }

  extractMetadata(ast) {
    const metadata = {
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      variables: [],
      complexity: 0
    };

    traverse.default(ast, {
      FunctionDeclaration(path) {
        metadata.functions.push({
          name: path.node.id?.name,
          params: path.node.params.map(p => p.name),
          async: path.node.async,
          generator: path.node.generator,
          loc: path.node.loc
        });
      },

      ClassDeclaration(path) {
        metadata.classes.push({
          name: path.node.id?.name,
          superClass: path.node.superClass?.name,
          methods: this.extractClassMethods(path.node),
          loc: path.node.loc
        });
      },

      ImportDeclaration(path) {
        metadata.imports.push({
          source: path.node.source.value,
          specifiers: path.node.specifiers.map(s => s.local.name)
        });
      },

      ExportNamedDeclaration(path) {
        metadata.exports.push({
          type: 'named',
          name: path.node.declaration?.id?.name
        });
      },

      VariableDeclaration(path) {
        path.node.declarations.forEach(decl => {
          metadata.variables.push({
            name: decl.id.name,
            kind: path.node.kind,
            loc: decl.loc
          });
        });
      },

      IfStatement() {
        metadata.complexity++;
      },

      ForStatement() {
        metadata.complexity++;
      },

      WhileStatement() {
        metadata.complexity++;
      },

      SwitchCase() {
        metadata.complexity++;
      }
    });

    return metadata;
  }

  extractClassMethods(classNode) {
    const methods = [];
    
    classNode.body.body.forEach(member => {
      if (member.type === 'ClassMethod') {
        methods.push({
          name: member.key.name,
          kind: member.kind,
          static: member.static,
          async: member.async
        });
      }
    });

    return methods;
  }

  analyzeComplexity(ast) {
    let complexity = 1; // Base complexity

    traverse.default(ast, {
      IfStatement() { complexity++; },
      ForStatement() { complexity++; },
      WhileStatement() { complexity++; },
      DoWhileStatement() { complexity++; },
      SwitchCase() { complexity++; },
      ConditionalExpression() { complexity++; },
      LogicalExpression() { complexity++; },
      CatchClause() { complexity++; }
    });

    return complexity;
  }

  findDependencies(ast) {
    const dependencies = new Set();

    traverse.default(ast, {
      ImportDeclaration(path) {
        dependencies.add(path.node.source.value);
      },
      CallExpression(path) {
        if (path.node.callee.name === 'require') {
          const arg = path.node.arguments[0];
          if (arg.type === 'StringLiteral') {
            dependencies.add(arg.value);
          }
        }
      }
    });

    return Array.from(dependencies);
  }

  findSecurityIssues(ast) {
    const issues = [];

    traverse.default(ast, {
      CallExpression(path) {
        const calleeName = path.node.callee.name || path.node.callee.property?.name;
        
        // Check for dangerous functions
        const dangerousFunctions = ['eval', 'Function', 'setTimeout', 'setInterval'];
        if (dangerousFunctions.includes(calleeName)) {
          issues.push({
            type: 'dangerous_function',
            function: calleeName,
            loc: path.node.loc,
            severity: 'high'
          });
        }
      },

      MemberExpression(path) {
        // Check for innerHTML usage
        if (path.node.property.name === 'innerHTML') {
          issues.push({
            type: 'xss_risk',
            detail: 'innerHTML usage detected',
            loc: path.node.loc,
            severity: 'medium'
          });
        }
      }
    });

    return issues;
  }
}

export default new ASTParser();
