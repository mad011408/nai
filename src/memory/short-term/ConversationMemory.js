import logger from '../../utils/logger.js';

export class ConversationMemory {
  constructor(maxMessages = 50) {
    this.conversations = new Map();
    this.maxMessages = maxMessages;
  }

  createConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        context: {},
        createdAt: new Date(),
        lastActivity: new Date()
      });
      logger.info(`Created conversation: ${conversationId}`);
    }
    return this.conversations.get(conversationId);
  }

  addMessage(conversationId, message) {
    const conversation = this.createConversation(conversationId);
    
    conversation.messages.push({
      ...message,
      timestamp: new Date()
    });

    // Trim old messages if exceeding max
    if (conversation.messages.length > this.maxMessages) {
      conversation.messages = conversation.messages.slice(-this.maxMessages);
    }

    conversation.lastActivity = new Date();
    
    logger.info(`Added message to conversation ${conversationId}`);
  }

  getMessages(conversationId, limit = null) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return [];

    const messages = conversation.messages;
    return limit ? messages.slice(-limit) : messages;
  }

  getContext(conversationId) {
    const conversation = this.conversations.get(conversationId);
    return conversation?.context || {};
  }

  updateContext(conversationId, contextUpdate) {
    const conversation = this.createConversation(conversationId);
    conversation.context = {
      ...conversation.context,
      ...contextUpdate
    };
    conversation.lastActivity = new Date();
  }

  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  deleteConversation(conversationId) {
    const deleted = this.conversations.delete(conversationId);
    if (deleted) {
      logger.info(`Deleted conversation: ${conversationId}`);
    }
    return deleted;
  }

  clearOldConversations(maxAgeHours = 24) {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const [id, conversation] of this.conversations.entries()) {
      const age = now - conversation.lastActivity;
      if (age > maxAge) {
        this.conversations.delete(id);
        logger.info(`Cleared old conversation: ${id}`);
      }
    }
  }

  getFormattedHistory(conversationId, limit = 10) {
    const messages = this.getMessages(conversationId, limit);
    
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  getSummary(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    return {
      id: conversation.id,
      messageCount: conversation.messages.length,
      createdAt: conversation.createdAt,
      lastActivity: conversation.lastActivity,
      context: conversation.context
    };
  }

  getAllConversations() {
    return Array.from(this.conversations.keys());
  }

  getStats() {
    return {
      totalConversations: this.conversations.size,
      totalMessages: Array.from(this.conversations.values())
        .reduce((sum, conv) => sum + conv.messages.length, 0)
    };
  }
}

export default new ConversationMemory();
