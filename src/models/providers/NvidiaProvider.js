import axios from 'axios';
import config from '../../../config/index.js';
import logger from '../../utils/logger.js';

export class NvidiaProvider {
  constructor() {
    this.apiKey = config.nvidia.apiKey;
    this.apiHost = config.nvidia.apiHost;
    this.apiPath = config.nvidia.apiPath;
    this.defaultModel = config.nvidia.defaultModel;
    this.models = config.nvidia.models;
    
    this.client = axios.create({
      baseURL: this.apiHost,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: config.performance.requestTimeout
    });
  }

  async chat(messages, options = {}) {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature || config.model.temperature;
      const maxTokens = options.maxTokens || config.model.maxTokens;
      const stream = options.stream || false;

      logger.info(`NVIDIA API call - Model: ${model}`);

      const response = await this.client.post(this.apiPath, {
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: config.model.topP,
        stream: stream
      });

      return {
        provider: 'nvidia',
        model: model,
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        finishReason: response.data.choices[0].finish_reason
      };
    } catch (error) {
      logger.error('NVIDIA API error:', error.response?.data || error.message);
      throw new Error(`NVIDIA API failed: ${error.message}`);
    }
  }

  async streamChat(messages, options = {}, onChunk) {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature || config.model.temperature;
      const maxTokens = options.maxTokens || config.model.maxTokens;

      const response = await this.client.post(this.apiPath, {
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: config.model.topP,
        stream: true
      }, {
        responseType: 'stream'
      });

      let fullContent = '';

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          resolve({
            provider: 'nvidia',
            model: model,
            content: fullContent
          });
        });
        response.data.on('error', reject);
      });
    } catch (error) {
      logger.error('NVIDIA Stream API error:', error.message);
      throw error;
    }
  }

  getAvailableModels() {
    return this.models;
  }

  isConfigured() {
    return !!this.apiKey;
  }
}

export default new NvidiaProvider();
