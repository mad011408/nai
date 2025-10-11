import aiEngine from '../../core/engine/AIEngine.js';
import astParser from '../code-analysis/ASTParser.js';
import logger from '../../utils/logger.js';

export class BugPredictor {
  constructor() {
    this.engine = aiEngine;
    this.parser = astParser;
    this.accuracyTarget = 0.999; // 99.9% accuracy
  }

  async predict(code, options = {}) {
    try {
      logger.info('Starting bug prediction');

      // Multi-layer analysis
      const staticAnalysis = await this.staticAnalysis(code);
      const aiAnalysis = await this.aiBasedAnalysis(code, options);
      const patternAnalysis = await this.patternBasedAnalysis(code);

      // Combine results
      const predictions = this.combinePredictions([
        staticAnalysis,
        aiAnalysis,
        patternAnalysis
      ]);

      return {
        success: true,
        predictions: predictions,
        confidence: this.calculateConfidence(predictions),
        recommendations: this.generateRecommendations(predictions)
      };
    } catch (error) {
      logger.error('Bug prediction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async staticAnalysis(code) {
    try {
      const parsed = this.parser.parse(code);
      const bugs = [];

      // Check complexity
      if (parsed.metadata.complexity > 10) {
        bugs.push({
          type: 'high_complexity',
          severity: 'medium',
          message: 'High cyclomatic complexity detected',
          confidence: 0.95,
          location: 'function'
        });
      }

      // Check security issues
      const securityIssues = this.parser.findSecurityIssues(parsed.ast);
      bugs.push(...securityIssues.map(issue => ({
        type: 'security',
        severity: issue.severity,
        message: `Security issue: ${issue.type}`,
        confidence: 0.98,
        location: issue.loc
      })));

      // Check for common patterns
      bugs.push(...this.checkCommonBugPatterns(code));

      return bugs;
    } catch (error) {
      logger.error('Static analysis failed:', error);
      return [];
    }
  }

  async aiBasedAnalysis(code, options) {
    const prompt = `Analyze this code for potential bugs, errors, and issues. Provide detailed predictions with confidence scores:

\`\`\`
${code}
\`\`\`

For each potential bug, provide:
1. Type of bug
2. Severity (low/medium/high/critical)
3. Description
4. Line number (if applicable)
5. Confidence score (0-1)
6. Suggested fix

Format as JSON array.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      model: options.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.2
    });

    return this.parseAIResponse(response.content);
  }

  async patternBasedAnalysis(code) {
    const bugs = [];

    // Common bug patterns
    const patterns = [
      {
        regex: /==\s*null/g,
        type: 'null_comparison',
        message: 'Use === instead of == for null comparison',
        severity: 'low',
        confidence: 0.9
      },
      {
        regex: /var\s+/g,
        type: 'var_usage',
        message: 'Use let or const instead of var',
        severity: 'low',
        confidence: 0.85
      },
      {
        regex: /console\.log/g,
        type: 'debug_code',
        message: 'Remove console.log in production',
        severity: 'low',
        confidence: 0.8
      },
      {
        regex: /eval\(/g,
        type: 'eval_usage',
        message: 'Avoid using eval() - security risk',
        severity: 'critical',
        confidence: 0.99
      },
      {
        regex: /innerHTML\s*=/g,
        type: 'xss_risk',
        message: 'innerHTML usage may lead to XSS',
        severity: 'high',
        confidence: 0.95
      }
    ];

    for (const pattern of patterns) {
      const matches = code.matchAll(pattern.regex);
      for (const match of matches) {
        bugs.push({
          type: pattern.type,
          severity: pattern.severity,
          message: pattern.message,
          confidence: pattern.confidence,
          location: this.getLineNumber(code, match.index)
        });
      }
    }

    return bugs;
  }

  checkCommonBugPatterns(code) {
    const bugs = [];

    // Check for async/await issues
    if (code.includes('async') && !code.includes('try')) {
      bugs.push({
        type: 'missing_error_handling',
        severity: 'medium',
        message: 'Async function without try-catch',
        confidence: 0.85
      });
    }

    // Check for promise without catch
    if (code.includes('.then(') && !code.includes('.catch(')) {
      bugs.push({
        type: 'unhandled_promise',
        severity: 'medium',
        message: 'Promise without catch handler',
        confidence: 0.88
      });
    }

    // Check for infinite loops
    if (code.match(/while\s*\(\s*true\s*\)/)) {
      bugs.push({
        type: 'infinite_loop',
        severity: 'high',
        message: 'Potential infinite loop detected',
        confidence: 0.75
      });
    }

    return bugs;
  }

  combinePredictions(analysisResults) {
    const allBugs = analysisResults.flat();
    
    // Deduplicate and merge similar bugs
    const uniqueBugs = new Map();
    
    for (const bug of allBugs) {
      const key = `${bug.type}_${bug.location}`;
      if (!uniqueBugs.has(key) || uniqueBugs.get(key).confidence < bug.confidence) {
        uniqueBugs.set(key, bug);
      }
    }

    // Sort by severity and confidence
    return Array.from(uniqueBugs.values()).sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }

  calculateConfidence(predictions) {
    if (predictions.length === 0) return 1.0;
    
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    return avgConfidence;
  }

  generateRecommendations(predictions) {
    const recommendations = [];

    const criticalBugs = predictions.filter(p => p.severity === 'critical');
    if (criticalBugs.length > 0) {
      recommendations.push({
        priority: 'critical',
        message: `Fix ${criticalBugs.length} critical security issues immediately`
      });
    }

    const highBugs = predictions.filter(p => p.severity === 'high');
    if (highBugs.length > 0) {
      recommendations.push({
        priority: 'high',
        message: `Address ${highBugs.length} high-severity bugs before deployment`
      });
    }

    if (predictions.length > 10) {
      recommendations.push({
        priority: 'medium',
        message: 'Consider refactoring - multiple potential issues detected'
      });
    }

    return recommendations;
  }

  parseAIResponse(content) {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      logger.warn('Failed to parse AI response as JSON');
      return [];
    }
  }

  getLineNumber(code, index) {
    const lines = code.substring(0, index).split('\n');
    return lines.length;
  }
}

export default new BugPredictor();
