export const modelConfig = {
  nvidia: {
    defaultModel: 'deepseek-ai/deepseek-v3.1',
    models: {
      'deepseek-ai/deepseek-v3.1': {
        maxTokens: 8192,
        contextWindow: 32768,
        costPer1kTokens: 0.001,
        capabilities: ['code', 'reasoning', 'analysis']
      },
      'deepseek-ai/deepseek-r1': {
        maxTokens: 8192,
        contextWindow: 32768,
        costPer1kTokens: 0.001,
        capabilities: ['reasoning', 'planning']
      },
      'meta/llama-3.1-405b-instruct': {
        maxTokens: 4096,
        contextWindow: 128000,
        costPer1kTokens: 0.002,
        capabilities: ['general', 'reasoning']
      },
      'qwen/qwen3-next-80b-a3b-thinking': {
        maxTokens: 8192,
        contextWindow: 32768,
        costPer1kTokens: 0.001,
        capabilities: ['reasoning', 'thinking', 'planning']
      }
    }
  },

  sambanova: {
    defaultModel: 'DeepSeek-V3.1',
    models: {
      'DeepSeek-V3.1': {
        maxTokens: 8192,
        contextWindow: 32768,
        costPer1kTokens: 0.001,
        capabilities: ['code', 'reasoning']
      },
      'DeepSeek-V3.1-Terminus': {
        maxTokens: 8192,
        contextWindow: 32768,
        costPer1kTokens: 0.001,
        capabilities: ['code', 'analysis']
      }
    }
  },

  cerebras: {
    defaultModel: 'qwen-3-coder-480b',
    models: {
      'qwen-3-coder-480b': {
        maxTokens: 8192,
        contextWindow: 32768,
        costPer1kTokens: 0.001,
        capabilities: ['code', 'generation', 'completion']
      },
      'qwen-3-235b-a22b-thinking-2507': {
        maxTokens: 8192,
        contextWindow: 32768,
        costPer1kTokens: 0.001,
        capabilities: ['reasoning', 'thinking']
      },
      'qwen-3-32b': {
        maxTokens: 4096,
        contextWindow: 16384,
        costPer1kTokens: 0.0005,
        capabilities: ['general', 'fast']
      }
    }
  }
};

export function getModelInfo(provider, model) {
  return modelConfig[provider]?.models[model] || null;
}

export function getDefaultModel(provider) {
  return modelConfig[provider]?.defaultModel || null;
}

export default modelConfig;
