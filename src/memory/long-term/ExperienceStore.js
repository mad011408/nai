import logger from '../../utils/logger.js';

export class ExperienceStore {
  constructor() {
    this.experiences = [];
    this.maxExperiences = 1000;
  }

  store(experience) {
    const stored = {
      id: Date.now() + Math.random(),
      ...experience,
      timestamp: Date.now()
    };

    this.experiences.push(stored);

    // Keep only recent experiences
    if (this.experiences.length > this.maxExperiences) {
      this.experiences.shift();
    }

    logger.info('Experience stored');
    return stored;
  }

  retrieve(criteria = {}) {
    let results = this.experiences;

    // Filter by criteria
    if (criteria.type) {
      results = results.filter(exp => exp.type === criteria.type);
    }

    if (criteria.minReward !== undefined) {
      results = results.filter(exp => exp.reward >= criteria.minReward);
    }

    if (criteria.since) {
      results = results.filter(exp => exp.timestamp >= criteria.since);
    }

    return results;
  }

  getSuccessful(limit = 10) {
    return this.experiences
      .filter(exp => exp.success === true)
      .sort((a, b) => b.reward - a.reward)
      .slice(0, limit);
  }

  getFailed(limit = 10) {
    return this.experiences
      .filter(exp => exp.success === false)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, limit);
  }

  getRecent(limit = 10) {
    return this.experiences
      .slice(-limit)
      .reverse();
  }

  analyze() {
    const total = this.experiences.length;
    const successful = this.experiences.filter(e => e.success).length;
    const failed = total - successful;

    const avgReward = this.experiences.reduce((sum, e) => 
      sum + (e.reward || 0), 0) / total;

    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      averageReward: avgReward
    };
  }

  clear() {
    this.experiences = [];
    logger.info('Experience store cleared');
  }

  export() {
    return this.experiences;
  }

  import(experiences) {
    this.experiences = experiences;
    logger.info(`Imported ${experiences.length} experiences`);
  }
}

export default new ExperienceStore();
