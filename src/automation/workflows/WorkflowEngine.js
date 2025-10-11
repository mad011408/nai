import logger from '../../utils/logger.js';
import codingAgent from '../../core/agents/CodingAgent.js';
import codeExecutor from '../../tools/execution/CodeExecutor.js';

export class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.runningWorkflows = new Map();
  }

  registerWorkflow(name, workflow) {
    this.workflows.set(name, workflow);
    logger.info(`Workflow registered: ${name}`);
  }

  async executeWorkflow(name, input, options = {}) {
    try {
      const workflow = this.workflows.get(name);
      
      if (!workflow) {
        throw new Error(`Workflow ${name} not found`);
      }

      const workflowId = `${name}_${Date.now()}`;
      logger.info(`Starting workflow: ${workflowId}`);

      this.runningWorkflows.set(workflowId, {
        name,
        status: 'running',
        startTime: Date.now(),
        currentStep: 0
      });

      const result = await this.runWorkflow(workflow, input, workflowId, options);

      this.runningWorkflows.delete(workflowId);

      return {
        success: true,
        workflowId,
        result,
        duration: Date.now() - this.runningWorkflows.get(workflowId)?.startTime
      };
    } catch (error) {
      logger.error(`Workflow ${name} failed:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runWorkflow(workflow, input, workflowId, options) {
    const results = [];
    let currentInput = input;

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      logger.info(`Executing step ${i + 1}/${workflow.steps.length}: ${step.name}`);
      
      const stepResult = await this.executeStep(step, currentInput, options);
      
      results.push({
        step: step.name,
        result: stepResult
      });

      if (!stepResult.success && !step.continueOnError) {
        throw new Error(`Step ${step.name} failed: ${stepResult.error}`);
      }

      currentInput = stepResult.output || currentInput;
    }

    return results;
  }

  async executeStep(step, input, options) {
    try {
      switch (step.type) {
        case 'generate':
          return await this.generateCodeStep(step, input, options);
        
        case 'analyze':
          return await this.analyzeCodeStep(step, input, options);
        
        case 'test':
          return await this.testCodeStep(step, input, options);
        
        case 'execute':
          return await this.executeCodeStep(step, input, options);
        
        case 'transform':
          return await this.transformStep(step, input, options);
        
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateCodeStep(step, input, options) {
    const result = await codingAgent.generateCode(
      step.description || input.description,
      step.language || 'javascript',
      options
    );

    return {
      success: result.success,
      output: { code: result.code },
      metadata: result.metadata
    };
  }

  async analyzeCodeStep(step, input, options) {
    const result = await codingAgent.analyzeCode(
      input.code,
      step.analysisType || 'full',
      options
    );

    return {
      success: result.success,
      output: { analysis: result.analysis },
      metadata: result.metadata
    };
  }

  async testCodeStep(step, input, options) {
    const result = await codingAgent.generateTests(
      input.code,
      step.framework || 'jest',
      options
    );

    return {
      success: result.success,
      output: { tests: result.tests },
      metadata: result.metadata
    };
  }

  async executeCodeStep(step, input, options) {
    const result = await codeExecutor.executeJavaScript(input.code);

    return {
      success: result.success,
      output: { result: result.result },
      metadata: { duration: result.duration }
    };
  }

  async transformStep(step, input, options) {
    const transformed = step.transform(input);
    
    return {
      success: true,
      output: transformed
    };
  }

  getWorkflowStatus(workflowId) {
    return this.runningWorkflows.get(workflowId);
  }

  listWorkflows() {
    return Array.from(this.workflows.keys());
  }

  // Predefined workflows
  registerDefaultWorkflows() {
    // Full development workflow
    this.registerWorkflow('full-development', {
      steps: [
        {
          name: 'Generate Code',
          type: 'generate',
          description: 'Generate initial code'
        },
        {
          name: 'Analyze Code',
          type: 'analyze',
          analysisType: 'full'
        },
        {
          name: 'Generate Tests',
          type: 'test',
          framework: 'jest'
        },
        {
          name: 'Execute Tests',
          type: 'execute'
        }
      ]
    });

    // Code review workflow
    this.registerWorkflow('code-review', {
      steps: [
        {
          name: 'Analyze Quality',
          type: 'analyze',
          analysisType: 'quality'
        },
        {
          name: 'Security Scan',
          type: 'analyze',
          analysisType: 'security'
        },
        {
          name: 'Performance Check',
          type: 'analyze',
          analysisType: 'performance'
        }
      ]
    });
  }
}

export default new WorkflowEngine();
