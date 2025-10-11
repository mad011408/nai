import codingAgent from './CodingAgent.js';
import reasoningAgent from './ReasoningAgent.js';
import planningAgent from './PlanningAgent.js';
import executionAgent from './ExecutionAgent.js';
import reviewAgent from './ReviewAgent.js';
import logger from '../../utils/logger.js';

export class MultiAgent {
  constructor() {
    this.agents = {
      coding: codingAgent,
      reasoning: reasoningAgent,
      planning: planningAgent,
      execution: executionAgent,
      review: reviewAgent
    };
  }

  async executeTask(task, context = {}) {
    const agent = this.selectAgent(task);
    
    if (!agent) {
      throw new Error(`No suitable agent found for task type: ${task.type}`);
    }

    logger.info(`MultiAgent delegating to ${agent.name}`);
    
    return await agent.execute(task, context);
  }

  selectAgent(task) {
    for (const agent of Object.values(this.agents)) {
      if (agent.canHandle(task)) {
        return agent;
      }
    }
    return null;
  }

  async collaborativeTask(tasks, context = {}) {
    const results = [];

    for (const task of tasks) {
      const result = await this.executeTask(task, context);
      results.push(result);

      if (!result.success && context.stopOnError) {
        break;
      }
    }

    return {
      success: results.every(r => r.success),
      results: results
    };
  }

  async parallelExecution(tasks, context = {}) {
    const promises = tasks.map(task => 
      this.executeTask(task, context).catch(error => ({
        success: false,
        error: error.message
      }))
    );

    const results = await Promise.all(promises);

    return {
      success: results.every(r => r.success),
      results: results
    };
  }

  getAgents() {
    return Object.keys(this.agents);
  }

  getAgentCapabilities(agentName) {
    const agent = this.agents[agentName];
    return agent ? agent.capabilities : [];
  }

  getAllCapabilities() {
    const capabilities = new Set();
    
    for (const agent of Object.values(this.agents)) {
      agent.capabilities.forEach(cap => capabilities.add(cap));
    }
    
    return Array.from(capabilities);
  }
}

export default new MultiAgent();
