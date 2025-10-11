import BaseAgent from './BaseAgent.js';
import codeExecutor from '../../tools/execution/CodeExecutor.js';
import logger from '../../utils/logger.js';

export class ExecutionAgent extends BaseAgent {
  constructor() {
    super('ExecutionAgent', [
      'code_execution',
      'task_execution',
      'workflow_execution',
      'command_execution'
    ]);
    this.executor = codeExecutor;
  }

  async performTask(task, context) {
    switch (task.type) {
      case 'code_execution':
        return await this.executeCode(task.code, task.language, context);
      
      case 'task_execution':
        return await this.executeTask(task.taskDef, context);
      
      case 'workflow_execution':
        return await this.executeWorkflow(task.workflow, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async executeCode(code, language = 'javascript', context) {
    logger.info(`Executing ${language} code`);

    try {
      let result;
      
      if (language === 'javascript') {
        result = await this.executor.executeJavaScript(code, context);
      } else if (language === 'python') {
        result = await this.executor.executePython(code, context);
      } else {
        result = await this.executor.executeNode(code, context);
      }

      return {
        success: result.success,
        output: result.stdout || result.result,
        error: result.stderr || result.error,
        duration: result.duration
      };
    } catch (error) {
      logger.error('Code execution failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeTask(taskDef, context) {
    const { action, parameters } = taskDef;

    logger.info(`Executing task: ${action}`);

    try {
      const result = await this.performAction(action, parameters, context);
      return {
        success: true,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeWorkflow(workflow, context) {
    const results = [];

    for (const step of workflow.steps) {
      const result = await this.executeTask(step, context);
      results.push(result);

      if (!result.success && !step.continueOnError) {
        break;
      }
    }

    return {
      success: results.every(r => r.success),
      results: results
    };
  }

  async performAction(action, parameters, context) {
    return { action, parameters, executed: true };
  }
}

export default new ExecutionAgent();
