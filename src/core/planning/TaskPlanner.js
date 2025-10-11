import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class TaskPlanner {
  constructor() {
    this.engine = aiEngine;
  }

  async createPlan(goal, constraints = {}, options = {}) {
    logger.info('Creating task plan');

    const prompt = `Create a detailed task plan for this goal:

Goal: ${goal}

Constraints:
- Time: ${constraints.time || 'flexible'}
- Resources: ${constraints.resources || 'standard'}
- Priority: ${constraints.priority || 'medium'}

Provide:
1. Task breakdown (numbered steps)
2. Dependencies between tasks
3. Estimated duration for each task
4. Required resources
5. Risk assessment
6. Success criteria`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.5
    });

    const tasks = this.parseTasks(response.content);

    return {
      success: true,
      goal: goal,
      plan: response.content,
      tasks: tasks,
      totalEstimatedTime: this.calculateTotalTime(tasks)
    };
  }

  parseTasks(content) {
    const tasks = [];
    const taskRegex = /(\d+)\.\s+([^\n]+)/g;
    let match;

    while ((match = taskRegex.exec(content)) !== null) {
      tasks.push({
        id: parseInt(match[1]),
        description: match[2].trim(),
        status: 'pending',
        dependencies: []
      });
    }

    return tasks;
  }

  calculateTotalTime(tasks) {
    return tasks.length * 30; // Rough estimate: 30 min per task
  }

  async updatePlan(plan, updates) {
    logger.info('Updating task plan');

    for (const update of updates) {
      const task = plan.tasks.find(t => t.id === update.taskId);
      if (task) {
        Object.assign(task, update.changes);
      }
    }

    return plan;
  }

  async optimizePlan(plan, options = {}) {
    const prompt = `Optimize this task plan:

${JSON.stringify(plan.tasks, null, 2)}

Optimize for:
- ${options.optimizeFor || 'time'}
- Parallel execution where possible
- Resource efficiency

Provide optimized task sequence.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.4
    });

    return {
      success: true,
      optimizedPlan: response.content
    };
  }
}

export default new TaskPlanner();
