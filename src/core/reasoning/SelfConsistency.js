import aiEngine from '../engine/AIEngine.js';
import logger from '../../utils/logger.js';

export class SelfConsistency {
  constructor() {
    this.engine = aiEngine;
    this.numSamples = 5;
  }

  async solve(problem, options = {}) {
    logger.info('Starting Self-Consistency reasoning');

    const samples = await this.generateMultipleSolutions(
      problem,
      options.numSamples || this.numSamples,
      options
    );

    const consensus = this.findConsensus(samples);

    return {
      success: true,
      problem: problem,
      samples: samples,
      consensus: consensus,
      confidence: this.calculateConfidence(samples, consensus)
    };
  }

  async generateMultipleSolutions(problem, numSamples, options) {
    const promises = [];

    for (let i = 0; i < numSamples; i++) {
      promises.push(this.generateSolution(problem, options));
    }

    const results = await Promise.all(promises);

    return results.map((result, index) => ({
      id: index + 1,
      solution: result.content,
      reasoning: this.extractReasoning(result.content),
      answer: this.extractAnswer(result.content)
    }));
  }

  async generateSolution(problem, options) {
    const prompt = `Solve this problem step by step:

${problem}

Provide your reasoning and final answer.`;

    return await this.engine.generateResponse(prompt, {
      provider: options.provider || 'nvidia',
      model: options.model || 'deepseek-ai/deepseek-v3.1',
      temperature: 0.8
    });
  }

  findConsensus(samples) {
    const answerCounts = new Map();

    for (const sample of samples) {
      const answer = sample.answer;
      answerCounts.set(answer, (answerCounts.get(answer) || 0) + 1);
    }

    let maxCount = 0;
    let consensusAnswer = null;

    for (const [answer, count] of answerCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        consensusAnswer = answer;
      }
    }

    return {
      answer: consensusAnswer,
      votes: maxCount,
      totalSamples: samples.length
    };
  }

  calculateConfidence(samples, consensus) {
    return consensus.votes / consensus.totalSamples;
  }

  extractReasoning(content) {
    const reasoningMatch = content.match(/reasoning[:\s]+(.*?)(?=answer|$)/is);
    return reasoningMatch ? reasoningMatch[1].trim() : content;
  }

  extractAnswer(content) {
    const answerMatch = content.match(/answer[:\s]+(.*?)$/is);
    if (answerMatch) {
      return answerMatch[1].trim();
    }

    const lines = content.split('\n');
    return lines[lines.length - 1].trim();
  }
}

export default new SelfConsistency();
