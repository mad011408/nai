import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class ExecutionPlanner {
  constructor() {
    this.engine = aiEngine;
  }

  async createExecutionPlan(tasks, resources = {}, options = {}) {
    logger.info('Creating execution plan');

    const prompt = `Create a detailed execution plan:

Tasks:
${JSON.stringify(tasks, null, 2)}

Available Resources:
${JSON.stringify(resources, null, 2)}

Provide:
1. Execution timeline with dates
2. Resource allocation per task
3. Parallel execution opportunities
4. Critical path
5. Milestones and checkpoints
6. Risk mitigation strategies`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.4
    });

    return {
      success: true,
      executionPlan: response.content,
      timeline: this.extractTimeline(response.content),
      milestones: this.extractMilestones(response.content)
    };
  }

  async optimizeExecution(plan, constraints = {}, options = {}) {
    const prompt = `Optimize this execution plan:

Plan:
${JSON.stringify(plan, null, 2)}

Constraints:
${JSON.stringify(constraints, null, 2)}

Optimize for:
- Minimum time
- Maximum resource efficiency
- Risk minimization

Provide optimized plan.`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.3
    });

    return {
      success: true,
      optimizedPlan: response.content
    };
  }

  extractTimeline(content) {
    const timeline = [];
    const dateRegex = /(\w+ \d+|\d{4}-\d{2}-\d{2})/g;
    const matches = content.matchAll(dateRegex);

    for (const match of matches) {
      timeline.push(match[1]);
    }

    return timeline;
  }

  extractMilestones(content) {
    const milestones = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.match(/milestone|checkpoint|deliverable/i)) {
        milestones.push(line.trim());
      }
    }

    return milestones;
  }

  async trackProgress(plan, completedTasks = []) {
    const totalTasks = plan.tasks ? plan.tasks.length : 0;
    const completed = completedTasks.length;
    const progress = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks: completed,
      remainingTasks: totalTasks - completed,
      progressPercentage: progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
    };
  }
}

export default new ExecutionPlanner();
