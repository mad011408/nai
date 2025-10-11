import BaseAgent from './BaseAgent.js';
import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class PlanningAgent extends BaseAgent {
  constructor() {
    super('PlanningAgent', [
      'task_planning',
      'goal_decomposition',
      'strategy_selection',
      'execution_planning'
    ]);
    this.aiEngine = aiEngine;
  }

  async performTask(task, context) {
    switch (task.type) {
      case 'task_planning':
        return await this.planTask(task.goal, context);
      
      case 'goal_decomposition':
        return await this.decomposeGoal(task.goal, context);
      
      case 'strategy_selection':
        return await this.selectStrategy(task.problem, context);
      
      case 'execution_planning':
        return await this.planExecution(task.plan, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async planTask(goal, context) {
    logger.info('Creating task plan');

    const prompt = `Create a detailed plan to achieve this goal:

Goal: ${goal}

Provide:
1. Main steps (numbered)
2. Dependencies between steps
3. Estimated effort for each step
4. Potential risks and mitigation
5. Success criteria`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      model: context.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.5
    });

    const steps = this.extractSteps(response.content);

    return {
      success: true,
      goal: goal,
      plan: response.content,
      steps: steps,
      metadata: {
        provider: response.provider,
        duration: response.duration
      }
    };
  }

  async decomposeGoal(goal, context) {
    const prompt = `Decompose this high-level goal into smaller, actionable subtasks:

Goal: ${goal}

Provide a hierarchical breakdown with:
1. Level 1: Major phases
2. Level 2: Key tasks within each phase
3. Level 3: Specific actions for each task`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.5
    });

    return {
      success: true,
      decomposition: response.content,
      subtasks: this.extractSubtasks(response.content)
    };
  }

  async selectStrategy(problem, context) {
    const prompt = `Analyze this problem and recommend the best strategy:

Problem: ${problem}

Consider:
1. Problem complexity
2. Available resources
3. Time constraints
4. Risk factors

Provide:
1. Multiple strategy options
2. Pros and cons of each
3. Recommended strategy with justification`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.6
    });

    return {
      success: true,
      strategies: response.content
    };
  }

  async planExecution(plan, context) {
    const prompt = `Create a detailed execution plan:

Plan: ${JSON.stringify(plan, null, 2)}

Provide:
1. Execution timeline
2. Resource allocation
3. Checkpoints and milestones
4. Monitoring strategy
5. Contingency plans`;

    const response = await this.aiEngine.generateResponse(prompt, {
      provider: context.provider || 'nvidia',
      temperature: 0.5
    });

    return {
      success: true,
      executionPlan: response.content
    };
  }

  extractSteps(content) {
    const stepRegex = /(\d+)\.\s+([^\n]+)/g;
    const steps = [];
    let match;

    while ((match = stepRegex.exec(content)) !== null) {
      steps.push({
        number: parseInt(match[1]),
        description: match[2].trim()
      });
    }

    return steps;
  }

  extractSubtasks(content) {
    return this.extractSteps(content);
  }
}

export default new PlanningAgent();
