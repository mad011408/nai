import logger from '../../utils/logger.js';
import { EventEmitter } from 'events';

export class BaseAgent extends EventEmitter {
  constructor(name, capabilities = []) {
    super();
    this.name = name;
    this.capabilities = capabilities;
    this.state = 'idle';
    this.taskHistory = [];
  }

  async execute(task, context = {}) {
    try {
      this.state = 'working';
      this.emit('taskStart', { task, timestamp: Date.now() });

      logger.info(`${this.name} executing task: ${task.type}`);

      const result = await this.performTask(task, context);

      this.taskHistory.push({
        task,
        result,
        timestamp: Date.now()
      });

      this.state = 'idle';
      this.emit('taskComplete', { task, result });

      return result;
    } catch (error) {
      this.state = 'error';
      this.emit('taskError', { task, error });
      logger.error(`${this.name} task failed:`, error);
      throw error;
    }
  }

  async performTask(task, context) {
    throw new Error('performTask must be implemented by subclass');
  }

  canHandle(task) {
    return this.capabilities.includes(task.type);
  }

  getState() {
    return this.state;
  }

  getHistory() {
    return this.taskHistory;
  }

  clearHistory() {
    this.taskHistory = [];
  }
}

export default BaseAgent;
