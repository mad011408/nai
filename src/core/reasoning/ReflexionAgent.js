import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class ReflexionAgent {
  constructor() {
    this.engine = aiEngine;
    this.maxAttempts = 3;
  }

  async solveWithReflection(problem, options = {}) {
    logger.info('Starting Reflexion process');

    let attempt = 0;
    let solved = false;
    const attempts = [];

    while (attempt < this.maxAttempts && !solved) {
      const solution = await this.attemptSolution(problem, attempts, options);
      const evaluation = await this.evaluateSolution(problem, solution, options);
      
      attempts.push({
        attempt: attempt + 1,
        solution: solution,
        evaluation: evaluation,
        success: evaluation.correct
      });

      if (evaluation.correct) {
        solved = true;
      } else {
        const reflection = await this.reflect(problem, solution, evaluation, options);
        attempts[attempt].reflection = reflection;
      }

      attempt++;
    }

    return {
      success: solved,
      problem: problem,
      attempts: attempts,
      finalSolution: attempts[attempts.length - 1].solution
    };
  }

  async attemptSolution(problem, previousAttempts, options) {
    let prompt = `Solve this problem:\n\n${problem}\n\n`;

    if (previousAttempts.length > 0) {
      prompt += 'Previous attempts and reflections:\n';
      previousAttempts.forEach((att, i) => {
        prompt += `Attempt ${i + 1}:\n`;
        prompt += `Solution: ${att.solution}\n`;
        prompt += `Issue: ${att.evaluation.feedback}\n`;
        prompt += `Reflection: ${att.reflection}\n\n`;
      });
      prompt += 'Based on these reflections, provide an improved solution:\n';
    }

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.7
    });

    return response.content;
  }

  async evaluateSolution(problem, solution, options) {
    const prompt = `Evaluate this solution:

Problem: ${problem}

Solution: ${solution}

Is the solution correct? Provide:
1. Correctness (yes/no)
2. Detailed feedback
3. What needs improvement`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.3
    });

    const correct = response.content.toLowerCase().includes('yes') || 
                   response.content.toLowerCase().includes('correct');

    return {
      correct: correct,
      feedback: response.content
    };
  }

  async reflect(problem, solution, evaluation, options) {
    const prompt = `Reflect on why this solution failed:

Problem: ${problem}
Solution: ${solution}
Feedback: ${evaluation.feedback}

Provide:
1. What went wrong
2. What assumptions were incorrect
3. What approach should be tried next`;

    const response = await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      temperature: 0.6
    });

    return response.content;
  }
}

export default new ReflexionAgent();
