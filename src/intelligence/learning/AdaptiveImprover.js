import reinforcementLearner from './ReinforcementLearner.js';
import feedbackProcessor from './FeedbackProcessor.js';
import patternLearner from './PatternLearner.js';
import logger from '../../utils/logger.js';

export class AdaptiveImprover {
  constructor() {
    this.rlLearner = reinforcementLearner;
    this.feedbackProc = feedbackProcessor;
    this.patternLearner = patternLearner;
    this.improvements = [];
  }

  async improve(task, result, feedback) {
    logger.info('Processing improvement cycle');

    // Record experience for RL
    const reward = this.calculateReward(feedback);
    this.rlLearner.recordExperience(task, result, reward, null);

    // Process feedback
    this.feedbackProc.processFeedback(feedback);

    // Learn patterns
    this.patternLearner.observe({ task, result, feedback });

    // Generate improvements
    const improvements = await this.generateImprovements();

    this.improvements.push({
      timestamp: Date.now(),
      improvements
    });

    return {
      success: true,
      improvements: improvements,
      stats: this.getStats()
    };
  }

  calculateReward(feedback) {
    let reward = 0;

    if (feedback.rating) {
      reward += (feedback.rating - 3) * 0.5;
    }

    if (feedback.helpful === true) reward += 1;
    if (feedback.helpful === false) reward -= 1;

    if (feedback.accurate === true) reward += 1;
    if (feedback.accurate === false) reward -= 1;

    return reward;
  }

  async generateImprovements() {
    const improvements = [];

    // From RL insights
    const rlInsights = this.rlLearner.learn();
    if (rlInsights.learned) {
      improvements.push({
        source: 'reinforcement_learning',
        insights: rlInsights.insights
      });
    }

    // From feedback
    const feedbackInsights = this.feedbackProc.getInsights();
    if (feedbackInsights.negative > 0) {
      improvements.push({
        source: 'user_feedback',
        issues: feedbackInsights.commonIssues
      });
    }

    // From patterns
    const patterns = this.patternLearner.getPatterns();
    if (patterns.length > 0) {
      improvements.push({
        source: 'pattern_learning',
        patterns: patterns.slice(0, 5)
      });
    }

    return improvements;
  }

  getStats() {
    return {
      rl: this.rlLearner.getStats(),
      feedback: this.feedbackProc.getInsights(),
      patterns: this.patternLearner.getPatterns().length,
      totalImprovements: this.improvements.length
    };
  }

  async applyImprovements(config) {
    logger.info('Applying learned improvements');

    const improvements = await this.generateImprovements();
    const applied = [];

    for (const improvement of improvements) {
      if (improvement.source === 'reinforcement_learning') {
        applied.push({
          type: 'rl_optimization',
          applied: true
        });
      }
    }

    return {
      success: true,
      applied: applied
    };
  }
}

export default new AdaptiveImprover();
