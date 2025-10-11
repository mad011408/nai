import BaseAgent from './BaseAgent.js';
import aiEngine from '../engine/AIEngine.js';
import bugPredictor from '../../intelligence/prediction/BugPredictor.js';
import logger from '../../utils/logger.js';

export class ReviewAgent extends BaseAgent {
  constructor() {
    super('ReviewAgent', [
      'code_review',
      'quality_assessment',
      'security_review',
      'performance_review'
    ]);
    this.aiEngine = aiEngine;
    this.bugPredictor = bugPredictor;
  }

  async performTask(task, context) {
    switch (task.type) {
      case 'code_review':
        return await this.reviewCode(task.code, context);
      
      case 'quality_assessment':
        return await this.assessQuality(task.code, context);
      
      case 'security_review':
        return await this.reviewSecurity(task.code, context);
      
      case 'performance_review':
        return await this.reviewPerformance(task.code, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async reviewCode(code, context) {
    logger.info('Performing code review');

    const prompt = `Perform a comprehensive code review:

\`\`\`
${code}
\`\`\`

Review for:
1. Code quality and readability
2. Best practices adherence
3. Potential bugs
4. Security issues
5. Performance concerns
6. Maintainability

Provide detailed feedback with specific line references where applicable.`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      model: context.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.3
    });

    const bugPredictions = await this.bugPredictor.predict(code, context);

    return {
      success: true,
      review: response.content,
      bugs: bugPredictions.predictions,
      recommendations: this.extractRecommendations(response.content)
    };
  }

  async assessQuality(code, context) {
    const prompt = `Assess the quality of this code:

\`\`\`
${code}
\`\`\`

Evaluate:
1. Code structure and organization
2. Naming conventions
3. Documentation
4. Error handling
5. Test coverage potential
6. Overall quality score (0-10)`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.3
    });

    return {
      success: true,
      assessment: response.content,
      score: this.extractScore(response.content)
    };
  }

  async reviewSecurity(code, context) {
    const prompt = `Perform a security review of this code:

\`\`\`
${code}
\`\`\`

Check for:
1. SQL injection vulnerabilities
2. XSS vulnerabilities
3. Authentication/authorization issues
4. Data exposure risks
5. Input validation
6. Cryptography issues

Provide severity ratings and remediation steps.`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.2
    });

    return {
      success: true,
      securityReview: response.content,
      vulnerabilities: this.extractVulnerabilities(response.content)
    };
  }

  async reviewPerformance(code, context) {
    const prompt = `Review this code for performance:

\`\`\`
${code}
\`\`\`

Analyze:
1. Time complexity
2. Space complexity
3. Bottlenecks
4. Optimization opportunities
5. Scalability concerns

Provide specific optimization suggestions.`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.3
    });

    return {
      success: true,
      performanceReview: response.content,
      optimizations: this.extractOptimizations(response.content)
    };
  }

  extractRecommendations(content) {
    const recommendations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.match(/recommend|suggest|should|consider/i)) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations;
  }

  extractScore(content) {
    const scoreMatch = content.match(/score[:\s]+(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : null;
  }

  extractVulnerabilities(content) {
    const vulnerabilities = [];
    const severityRegex = /(critical|high|medium|low).*vulnerability/gi;
    const matches = content.matchAll(severityRegex);
    
    for (const match of matches) {
      vulnerabilities.push({
        severity: match[1].toLowerCase(),
        description: match[0]
      });
    }
    
    return vulnerabilities;
  }

  extractOptimizations(content) {
    const optimizations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.match(/optimize|improve|reduce|enhance/i)) {
        optimizations.push(line.trim());
      }
    }
    
    return optimizations;
  }
}

export default new ReviewAgent();
