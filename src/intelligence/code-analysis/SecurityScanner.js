import astParser from './ASTParser.js';
import aiEngine from '../../core/engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class SecurityScanner {
  constructor() {
    this.parser = astParser;
    this.engine = aiEngine;
    this.vulnerabilityPatterns = this.initializePatterns();
  }

  initializePatterns() {
    return {
      xss: [
        { pattern: /innerHTML\s*=/, severity: 'high', description: 'XSS via innerHTML' },
        { pattern: /document\.write/, severity: 'high', description: 'XSS via document.write' },
        { pattern: /eval\(/, severity: 'critical', description: 'Code injection via eval' }
      ],
      sqlInjection: [
        { pattern: /query\s*=\s*["'].*\+.*["']/, severity: 'critical', description: 'SQL injection risk' },
        { pattern: /execute\(.*\+.*\)/, severity: 'high', description: 'SQL injection via string concatenation' }
      ],
      commandInjection: [
        { pattern: /exec\(/, severity: 'critical', description: 'Command injection risk' },
        { pattern: /spawn\(/, severity: 'high', description: 'Command execution risk' }
      ],
      pathTraversal: [
        { pattern: /\.\.\//, severity: 'medium', description: 'Path traversal risk' },
        { pattern: /readFile\(.*\+/, severity: 'medium', description: 'Unsafe file access' }
      ],
      crypto: [
        { pattern: /md5|sha1/i, severity: 'medium', description: 'Weak cryptographic algorithm' },
        { pattern: /Math\.random/, severity: 'low', description: 'Insecure random number generation' }
      ]
    };
  }

  async scan(code, options = {}) {
    logger.info('Scanning for security vulnerabilities');

    const staticScan = this.staticScan(code);
    const astScan = this.scanAST(code);
    const aiScan = await this.aiBasedScan(code, options);

    const allVulnerabilities = [
      ...staticScan,
      ...astScan,
      ...aiScan
    ];

    return {
      success: true,
      vulnerabilities: allVulnerabilities,
      summary: this.generateSummary(allVulnerabilities),
      securityScore: this.calculateSecurityScore(allVulnerabilities)
    };
  }

  staticScan(code) {
    const vulnerabilities = [];

    for (const [category, patterns] of Object.entries(this.vulnerabilityPatterns)) {
      for (const { pattern, severity, description } of patterns) {
        const matches = code.matchAll(new RegExp(pattern, 'g'));
        for (const match of matches) {
          vulnerabilities.push({
            category,
            severity,
            description,
            location: this.getLineNumber(code, match.index),
            code: match[0]
          });
        }
      }
    }

    return vulnerabilities;
  }

  scanAST(code) {
    try {
      const parsed = this.parser.parse(code);
      return this.parser.findSecurityIssues(parsed.ast);
    } catch (error) {
      logger.warn('AST scan failed:', error);
      return [];
    }
  }

  async aiBasedScan(code, options) {
    const prompt = `Perform a security audit of this code:

\`\`\`
${code}
\`\`\`

Identify:
1. Security vulnerabilities
2. Severity level (critical/high/medium/low)
3. Exploitation scenarios
4. Remediation steps

Focus on: XSS, SQL injection, authentication, authorization, data exposure, cryptography.`;

    try {
      const response = await this.engine.generateResponse(prompt, {
        provider: options.provider || 'nvidia',
        temperature: 0.2
      });

      return this.parseAIVulnerabilities(response.content);
    } catch (error) {
      logger.error('AI-based scan failed:', error);
      return [];
    }
  }

  parseAIVulnerabilities(content) {
    const vulnerabilities = [];
    const severityRegex = /(critical|high|medium|low).*?vulnerability/gi;
    const matches = content.matchAll(severityRegex);

    for (const match of matches) {
      vulnerabilities.push({
        category: 'ai-detected',
        severity: match[1].toLowerCase(),
        description: match[0],
        location: 'unknown'
      });
    }

    return vulnerabilities;
  }

  generateSummary(vulnerabilities) {
    const summary = {
      total: vulnerabilities.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const vuln of vulnerabilities) {
      summary[vuln.severity]++;
    }

    return summary;
  }

  calculateSecurityScore(vulnerabilities) {
    let score = 100;

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    }

    return Math.max(0, score);
  }

  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }
}

export default new SecurityScanner();
