import dotenv from 'dotenv';
dotenv.config();

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',

  // API Providers
  nvidia: {
    apiKey: process.env.NVIDIA_API_KEY,
    apiHost: process.env.NVIDIA_API_HOST || 'https://integrate.api.nvidia.com',
    apiPath: process.env.NVIDIA_API_PATH || '/v1/chat/completions',
    defaultModel: process.env.NVIDIA_DEFAULT_MODEL || 'deepseek-ai/deepseek-v3.1',
    models: [
      'moonshotai/kimi-k2-instruct-0905',
      'bytedance/seed-oss-36b-instruct',
      'moonshotai/kimi-k2-instruct',
      'qwen/qwen3-next-80b-a3b-thinking',
      'igenius/colosseum_355b_instruct_16k',
      'meta/llama-3.1-405b-instruct',
      'microsoft/phi-3.5-moe-instruct',
      'deepseek-ai/deepseek-r1',
      'qwen/qwen3-next-80b-a3b-instruct',
      'nvidia/nvidia-nemotron-nano-9b-v2',
      'deepseek-ai/deepseek-v3.1',
      'microsoft/phi-4-mini-instruct',
      'openai/gpt-oss-120b'
    ]
  },

  sambanova: {
    apiKey: process.env.SAMBANOVA_API_KEY,
    apiHost: process.env.SAMBANOVA_API_HOST || 'https://api.sambanova.ai',
    apiPath: process.env.SAMBANOVA_API_PATH || '/v1/chat/completions',
    defaultModel: process.env.SAMBANOVA_DEFAULT_MODEL || 'DeepSeek-V3.1',
    models: [
      'DeepSeek-V3.1-Terminus',
      'DeepSeek-V3.1',
      'gpt-oss-120b'
    ]
  },

  cerebras: {
    apiKey: process.env.CEREBRAS_API_KEY,
    apiHost: process.env.CEREBRAS_API_HOST || 'https://api.cerebras.ai',
    apiPath: process.env.CEREBRAS_API_PATH || '/v1/chat/completions',
    defaultModel: process.env.CEREBRAS_DEFAULT_MODEL || 'qwen-3-coder-480b',
    models: [
      'qwen-3-coder-480b',
      'qwen-3-32b',
      'qwen-3-235b-a22b-thinking-2507',
      'gpt-oss-120b'
    ]
  },

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/advanced-ai-agent'
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },

  chroma: {
    host: process.env.CHROMA_HOST || 'localhost',
    port: parseInt(process.env.CHROMA_PORT) || 8000
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600,
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
  },

  // Performance
  performance: {
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 100,
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
    batchSize: parseInt(process.env.BATCH_SIZE) || 10
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // Model Settings
  model: {
    temperature: parseFloat(process.env.DEFAULT_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS) || 4096,
    topP: parseFloat(process.env.DEFAULT_TOP_P) || 0.9
  },

  // Agent Configuration
  agent: {
    enableReasoning: process.env.ENABLE_REASONING === 'true',
    enablePlanning: process.env.ENABLE_PLANNING === 'true',
    enableLearning: process.env.ENABLE_LEARNING === 'true',
    maxReasoningDepth: parseInt(process.env.MAX_REASONING_DEPTH) || 5
  }
};
