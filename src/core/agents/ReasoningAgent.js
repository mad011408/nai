import BaseAgent from './BaseAgent.js';
import chainOfThought from '../reasoning/ChainOfThought.js';
import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class ReasoningAgent extends BaseAgent {
  constructor() {
    super('ReasoningAgent', [
      'reasoning',
      'problem_solving',
      'logical_analysis',
      'decision_making'
    ]);
    this.reasoningEngine = chainOfThought;
    this.aiEngine = aiEngine;
  }

  async performTask(task, context) {
    switch (task.type) {
      case 'reasoning':
        return await this.reason(task.problem, context);
      
      case 'problem_solving':
        return await this.solveProblem(task.problem, context);
      
      case 'logical_analysis':
        return await this.analyzeLogic(task.statement, context);
      
      case 'decision_making':
        return await this.makeDecision(task.options, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async reason(problem, context) {
    logger.info('Starting reasoning process');
    
    const result = await this.reasoningEngine.reason(problem, {
      provider: context.provider || 'nvidia',
      model: context.model || 'qwen/qwen3-next-80b-a3b-thinking'
    });

    return {
      success: true,
      reasoning: result.reasoning,
      answer: result.finalAnswer,
      steps: result.steps
    };
  }

  async solveProblem(problem, context) {
    const prompt = `Solve this problem using logical reasoning:

Problem: ${problem}

Provide:
1. Problem analysis
2. Solution approach
3. Step-by-step solution
4. Final answer`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.7
    });

    return {
      success: true,
      solution: response.content
    };
  }

  async analyzeLogic(statement, context) {
    const prompt = `Analyze the logical structure of this statement:

Statement: ${statement}

Provide:
1. Logical form
2. Premises and conclusions
3. Validity assessment
4. Potential fallacies`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.5
    });

    return {
      success: true,
      analysis: response.content
    };
  }

  async makeDecision(options, context) {
    const prompt = `Analyze these options and recommend the best choice:

Options:
${JSON.stringify(options, null, 2)}

Criteria: ${context.criteria || 'effectiveness, feasibility, impact'}

Provide:
1. Analysis of each option
2. Comparison
3. Recommendation with reasoning`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.6
    });

    return {
      success: true,
      decision: response.content
    };
  }
}

export default new ReasoningAgent();
