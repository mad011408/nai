import nvidiaProvider from '../../models/providers/NvidiaProvider.js';
import sambanovaProvider from '../../models/providers/SambanovaProvider.js';
import cerebrasProvider from '../../models/providers/CerebrasProvider.js';
import logger from '../../utils/logger.js';

export class ModelOrchestrator {
  constructor() {
    this.providers = {
      nvidia: nvidiaProvider,
      sambanova: sambanovaProvider,
      cerebras: cerebrasProvider
    };
    this.defaultProvider = 'nvidia';
  }

  async chat(messages, options = {}) {
    const provider = options.provider || this.defaultProvider;
    const providerInstance = this.providers[provider];

    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }

    if (!providerInstance.isConfigured()) {
      throw new Error(`Provider ${provider} is not configured. Please set API key.`);
    }

    try {
      const startTime = Date.now();
      const response = await providerInstance.chat(messages, options);
      const duration = Date.now() - startTime;

      logger.info(`Chat completed - Provider: ${provider}, Duration: ${duration}ms`);

      return {
        ...response,
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Chat failed - Provider: ${provider}`, error);
      
      // Fallback to another provider
      if (options.enableFallback !== false) {
        return await this.chatWithFallback(messages, options, provider);
      }
      
      throw error;
    }
  }

  async chatWithFallback(messages, options, failedProvider) {
    const availableProviders = Object.keys(this.providers)
      .filter(p => p !== failedProvider && this.providers[p].isConfigured());

    for (const provider of availableProviders) {
      try {
        logger.info(`Trying fallback provider: ${provider}`);
        return await this.providers[provider].chat(messages, options);
      } catch (error) {
        logger.warn(`Fallback provider ${provider} also failed`);
        continue;
      }
    }

    throw new Error('All providers failed');
  }

  async streamChat(messages, options = {}, onChunk) {
    const provider = options.provider || this.defaultProvider;
    const providerInstance = this.providers[provider];

    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }

    if (!providerInstance.isConfigured()) {
      throw new Error(`Provider ${provider} is not configured`);
    }

    return await providerInstance.streamChat(messages, options, onChunk);
  }

  async parallelChat(messages, providers = ['nvidia', 'sambanova', 'cerebras'], options = {}) {
    const promises = providers
      .filter(p => this.providers[p]?.isConfigured())
      .map(provider => 
        this.chat(messages, { ...options, provider, enableFallback: false })
          .catch(error => ({ provider, error: error.message }))
      );

    const results = await Promise.all(promises);
    
    // Return best result based on criteria
    const successfulResults = results.filter(r => !r.error);
    if (successfulResults.length === 0) {
      throw new Error('All parallel requests failed');
    }

    // Select fastest response
    return successfulResults.reduce((best, current) => 
      current.duration < best.duration ? current : best
    );
  }

  async ensembleChat(messages, providers = ['nvidia', 'sambanova'], options = {}) {
    const results = await this.parallelChat(messages, providers, options);
    
    // Could implement voting or averaging logic here
    // For now, return the fastest
    return results;
  }

  getAvailableProviders() {
    return Object.keys(this.providers)
      .filter(p => this.providers[p].isConfigured())
      .map(p => ({
        name: p,
        models: this.providers[p].getAvailableModels()
      }));
  }

  getProvider(name) {
    return this.providers[name];
  }
}

export default new ModelOrchestrator();
