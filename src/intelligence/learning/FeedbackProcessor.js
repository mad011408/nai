import logger from '../../utils/logger.js';

export class FeedbackProcessor {
  constructor() {
    this.feedback = [];
    this.categories = {
      positive: [],
      negative: [],
      neutral: []
    };
  }

  processFeedback(feedback) {
    const processed = {
      id: Date.now(),
      ...feedback,
      category: this.categorizeFeedback(feedback),
      sentiment: this.analyzeSentiment(feedback.comment || ''),
      timestamp: Date.now()
    };

    this.feedback.push(processed);
    this.categories[processed.category].push(processed);

    logger.info(`Feedback processed: ${processed.category}`);

    return processed;
  }

  categorizeFeedback(feedback) {
    if (feedback.rating >= 4 || feedback.helpful === true) {
      return 'positive';
    } else if (feedback.rating <= 2 || feedback.helpful === false) {
      return 'negative';
    }
    return 'neutral';
  }

  analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'perfect', 'awesome'];
    const negativeWords = ['bad', 'poor', 'wrong', 'incorrect', 'useless', 'terrible'];

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) score++;
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) score--;
    }

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  getInsights() {
    return {
      total: this.feedback.length,
      positive: this.categories.positive.length,
      negative: this.categories.negative.length,
      neutral: this.categories.neutral.length,
      averageRating: this.calculateAverageRating(),
      commonIssues: this.identifyCommonIssues()
    };
  }

  calculateAverageRating() {
    const rated = this.feedback.filter(f => f.rating);
    if (rated.length === 0) return 0;
    const total = rated.reduce((sum, f) => sum + f.rating, 0);
    return total / rated.length;
  }

  identifyCommonIssues() {
    const issues = [];
    const negativeFeedback = this.categories.negative;

    for (const feedback of negativeFeedback) {
      if (feedback.comment) {
        issues.push(feedback.comment);
      }
    }

    return issues;
  }

  getRecentFeedback(limit = 10) {
    return this.feedback.slice(-limit).reverse();
  }
}

export default new FeedbackProcessor();
