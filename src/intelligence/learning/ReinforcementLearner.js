import logger from '../../utils/logger.js';

export class ReinforcementLearner {
  constructor() {
    this.experiences = [];
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
  }

  recordExperience(state, action, reward, nextState) {
    this.experiences.push({
      state,
      action,
      reward,
      nextState,
      timestamp: Date.now()
    });

    logger.info(`Experience recorded: reward=${reward}`);

    if (this.experiences.length > 1000) {
      this.experiences.shift();
    }
  }

  learn() {
    if (this.experiences.length < 10) {
      return { learned: false, reason: 'Insufficient experiences' };
    }

    const insights = this.extractInsights();
    const patterns = this.identifyPatterns();

    return {
      learned: true,
      insights: insights,
      patterns: patterns,
      experienceCount: this.experiences.length
    };
  }

  extractInsights() {
    const insights = [];

    // Calculate average reward per action type
    const actionRewards = new Map();

    for (const exp of this.experiences) {
      if (!actionRewards.has(exp.action)) {
        actionRewards.set(exp.action, []);
      }
      actionRewards.get(exp.action).push(exp.reward);
    }

    for (const [action, rewards] of actionRewards.entries()) {
      const avgReward = rewards.reduce((a, b) => a + b, 0) / rewards.length;
      insights.push({
        action,
        averageReward: avgReward,
        count: rewards.length
      });
    }

    return insights.sort((a, b) => b.averageReward - a.averageReward);
  }

  identifyPatterns() {
    const patterns = [];

    // Find successful sequences
    for (let i = 0; i < this.experiences.length - 2; i++) {
      const sequence = this.experiences.slice(i, i + 3);
      const totalReward = sequence.reduce((sum, exp) => sum + exp.reward, 0);

      if (totalReward > 2) {
        patterns.push({
          sequence: sequence.map(e => e.action),
          reward: totalReward
        });
      }
    }

    return patterns;
  }

  getBestAction(state) {
    const insights = this.extractInsights();
    return insights.length > 0 ? insights[0].action : null;
  }

  getStats() {
    return {
      totalExperiences: this.experiences.length,
      averageReward: this.calculateAverageReward(),
      learningRate: this.learningRate
    };
  }

  calculateAverageReward() {
    if (this.experiences.length === 0) return 0;
    const total = this.experiences.reduce((sum, exp) => sum + exp.reward, 0);
    return total / this.experiences.length;
  }
}

export default new ReinforcementLearner();
