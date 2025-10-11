import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class ReActAgent {
  constructor() {
    this.engine = aiEngine;
    this.maxIterations = 10;
  }

  async solve(problem, tools = [], options = {}) {
    logger.info('Starting ReAct (Reasoning + Acting) process');

    const history = [];
    let iteration = 0;
    let solved = false;

    while (iteration < this.maxIterations && !solved) {
      const step = await this.reasonAndAct(problem, history, tools, options);
      history.push(step);

      if (step.action === 'FINISH') {
        solved = true;
      }

      iteration++;
    }

    return {
      success: solved,
      problem: problem,
      history: history,
      answer: history[history.length - 1]?.observation || 'No solution found'
    };
  }

  async reasonAndAct(problem, history, tools, options) {
    const prompt = this.buildPrompt(problem, history, tools);

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      model: options.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.7
    });

    const parsed = this.parseResponse(response.content);

    if (parsed.action !== 'FINISH') {
      parsed.observation = await this.executeAction(parsed.action, parsed.actionInput, tools);
    }

    return parsed;
  }

  buildPrompt(problem, history, tools) {
    let prompt = `Solve this problem using reasoning and actions:

Problem: ${problem}

Available tools: ${tools.map(t => t.name).join(', ')}

`;

    if (history.length > 0) {
      prompt += 'Previous steps:\n';
      history.forEach((step, i) => {
        prompt += `${i + 1}. Thought: ${step.thought}\n`;
        prompt += `   Action: ${step.action}\n`;
        if (step.observation) {
          prompt += `   Observation: ${step.observation}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += `Next step:
Thought: [your reasoning]
Action: [tool name or FINISH]
Action Input: [input for the tool]`;

    return prompt;
  }

  parseResponse(content) {
    const thoughtMatch = content.match(/Thought:\s*(.+?)(?=Action:|$)/s);
    const actionMatch = content.match(/Action:\s*(.+?)(?=Action Input:|$)/s);
    const inputMatch = content.match(/Action Input:\s*(.+?)$/s);

    return {
      thought: thoughtMatch ? thoughtMatch[1].trim() : '',
      action: actionMatch ? actionMatch[1].trim() : 'FINISH',
      actionInput: inputMatch ? inputMatch[1].trim() : '',
      observation: null
    };
  }

  async executeAction(action, input, tools) {
    const tool = tools.find(t => t.name === action);

    if (!tool) {
      return `Tool ${action} not found`;
    }

    try {
      return await tool.execute(input);
    } catch (error) {
      return `Error executing ${action}: ${error.message}`;
    }
  }
}

export default new ReActAgent();
