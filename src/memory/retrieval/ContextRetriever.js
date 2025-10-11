import conversationMemory from '../short-term/ConversationMemory.js';
import workingMemory from '../short-term/WorkingMemory.js';
import logger from '../../utils/logger.js';

export class ContextRetriever {
  constructor() {
    this.conversationMem = conversationMemory;
    this.workingMem = workingMemory;
  }

  async retrieveContext(conversationId, options = {}) {
    logger.info(`Retrieving context for conversation: ${conversationId}`);

    const conversationHistory = this.conversationMem.getMessages(
      conversationId, 
      options.messageLimit || 10
    );

    const conversationContext = this.conversationMem.getContext(conversationId);
    const workingContext = this.workingMem.getAll();

    return {
      success: true,
      conversationHistory,
      conversationContext,
      workingContext,
      timestamp: Date.now()
    };
  }

  async retrieveRelevantContext(query, conversationId, options = {}) {
    const allContext = await this.retrieveContext(conversationId, options);

    // Filter relevant messages
    const relevantMessages = allContext.conversationHistory.filter(msg =>
      this.isRelevant(msg.content, query)
    );

    return {
      success: true,
      query,
      relevantMessages,
      context: allContext.conversationContext
    };
  }

  isRelevant(content, query) {
    const queryWords = query.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();

    let matches = 0;
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        matches++;
      }
    }

    return matches / queryWords.length > 0.3; // 30% match threshold
  }

  async summarizeContext(conversationId, options = {}) {
    const context = await this.retrieveContext(conversationId, options);

    const summary = {
      conversationId,
      messageCount: context.conversationHistory.length,
      participants: this.extractParticipants(context.conversationHistory),
      topics: this.extractTopics(context.conversationHistory),
      lastActivity: context.conversationHistory.length > 0 ?
        context.conversationHistory[context.conversationHistory.length - 1].timestamp : null
    };

    return summary;
  }

  extractParticipants(messages) {
    const participants = new Set();
    messages.forEach(msg => participants.add(msg.role));
    return Array.from(participants);
  }

  extractTopics(messages) {
    // Simple topic extraction based on frequent words
    const wordFreq = new Map();

    messages.forEach(msg => {
      const words = msg.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) { // Only words longer than 4 chars
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}

export default new ContextRetriever();
