import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class ChainOfThought {
  constructor() {
    this.engine = aiEngine;
    this.maxSteps = 10;
  }

  async reason(problem, options = {}) {
    logger.info('Starting Chain of Thought reasoning');
    
    const steps = [];
    let currentProblem = problem;
    let stepCount = 0;

    try {
      while (stepCount < this.maxSteps) {
        const step = await this.reasonStep(currentProblem, steps, options);
        steps.push(step);
        stepCount++;

        if (step.isFinal) {
          logger.info(`Chain of Thought completed in ${stepCount} steps`);
          break;
        }

        currentProblem = step.nextQuestion;
      }

      return {
        success: true,
        steps: steps,
        finalAnswer: steps[steps.length - 1].answer,
        reasoning: this.formatReasoning(steps)
      };
    } catch (error) {
      logger.error('Chain of Thought reasoning failed:', error);
      return {
        success: false,
        error: error.message,
        steps: steps
      };
    }
  }

  async reasonStep(problem, previousSteps, options) {
    const prompt = this.buildStepPrompt(problem, previousSteps);
    
    const response = await this.engine.generateResponse(prompt, {
      ...options,
      temperature: 0.7,
      model: options.model || 'qwen/qwen3-next-80b-a3b-thinking'
    });

    return this.parseStepResponse(response.content);
  }

  buildStepPrompt(problem, previousSteps) {
    let prompt = 'Think step by step to solve this problem:\n\n';
    prompt += `Problem: ${problem}\n\n`;

    if (previousSteps.length > 0) {
      prompt += 'Previous reasoning steps:\n';
      previousSteps.forEach((step, index) => {
        prompt += `${index + 1}. ${step.thought}\n`;
      });
      prompt += '\n';
    }

    prompt += 'Provide the next step in your reasoning. Format your response as:\n';
    prompt += 'THOUGHT: [your reasoning]\n';
    prompt += 'ANSWER: [partial or final answer]\n';
    prompt += 'NEXT: [next question to explore, or "COMPLETE" if done]\n';

    return prompt;
  }

  parseStepResponse(content) {
    const thoughtMatch = content.match(/THOUGHT:\s*(.*?)(?=ANSWER:|$)/s);
    const answerMatch = content.match(/ANSWER:\s*(.*?)(?=NEXT:|$)/s);
    const nextMatch = content.match(/NEXT:\s*(.*?)$/s);

    const thought = thoughtMatch ? thoughtMatch[1].trim() : content;
    const answer = answerMatch ? answerMatch[1].trim() : '';
    const next = nextMatch ? nextMatch[1].trim() : '';

    return {
      thought,
      answer,
      nextQuestion: next,
      isFinal: next.toUpperCase() === 'COMPLETE' || !next
    };
  }

  formatReasoning(steps) {
    return steps.map((step, index) => 
      `Step ${index + 1}: ${step.thought}\nResult: ${step.answer}`
    ).join('\n\n');
  }

  async solveCodeProblem(problem, options = {}) {
    const codingPrompt = `Solve this coding problem using step-by-step reasoning:\n\n${problem}\n\nBreak down the solution into logical steps.`;
    return await this.reason(codingPrompt, options);
  }
}

export default new ChainOfThought();
