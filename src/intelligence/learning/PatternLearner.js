import logger from '../../utils/logger.js';

export class PatternLearner {
  constructor() {
    this.patterns = new Map();
    this.observations = [];
  }

  observe(data) {
    this.observations.push({
      data,
      timestamp: Date.now()
    });

    if (this.observations.length > 100) {
      this.learnPatterns();
    }

    logger.info('Observation recorded');
  }

  learnPatterns() {
    logger.info('Learning patterns from observations');

    const sequences = this.extractSequences();
    const frequencies = this.calculateFrequencies(sequences);

    for (const [pattern, frequency] of frequencies.entries()) {
      if (frequency > 3) {
        this.patterns.set(pattern, {
          frequency,
          confidence: frequency / this.observations.length,
          lastSeen: Date.now()
        });
      }
    }

    return {
      patternsLearned: this.patterns.size,
      observations: this.observations.length
    };
  }

  extractSequences() {
    const sequences = [];

    for (let i = 0; i < this.observations.length - 2; i++) {
      const sequence = [
        this.observations[i].data,
        this.observations[i + 1].data,
        this.observations[i + 2].data
      ];
      sequences.push(JSON.stringify(sequence));
    }

    return sequences;
  }

  calculateFrequencies(sequences) {
    const frequencies = new Map();

    for (const seq of sequences) {
      frequencies.set(seq, (frequencies.get(seq) || 0) + 1);
    }

    return frequencies;
  }

  predictNext(currentSequence) {
    const key = JSON.stringify(currentSequence);
    const pattern = this.patterns.get(key);

    if (pattern) {
      return {
        prediction: 'Pattern found',
        confidence: pattern.confidence
      };
    }

    return {
      prediction: 'No pattern found',
      confidence: 0
    };
  }

  getPatterns() {
    return Array.from(this.patterns.entries()).map(([pattern, data]) => ({
      pattern: JSON.parse(pattern),
      ...data
    }));
  }

  clearOldPatterns(maxAge = 86400000) {
    const now = Date.now();
    
    for (const [pattern, data] of this.patterns.entries()) {
      if (now - data.lastSeen > maxAge) {
        this.patterns.delete(pattern);
      }
    }
  }
}

export default new PatternLearner();
