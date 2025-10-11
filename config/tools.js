export const toolsConfig = {
  execution: {
    timeout: 30000,
    maxMemory: '512mb',
    sandboxEnabled: true,
    allowedModules: ['fs', 'path', 'crypto', 'util']
  },

  fileOperations: {
    maxFileSize: 10485760, // 10MB
    allowedExtensions: ['.js', '.ts', '.py', '.java', '.cpp', '.go', '.rs'],
    tempDirectory: './data/temp'
  },

  git: {
    defaultBranch: 'main',
    autoCommit: false,
    commitMessageTemplate: 'AI Agent: {action} - {timestamp}'
  },

  web: {
    timeout: 15000,
    maxRetries: 3,
    userAgent: 'AdvancedAIAgent/1.0',
    headless: true
  },

  database: {
    connectionTimeout: 5000,
    queryTimeout: 10000,
    maxConnections: 10
  }
};

export default toolsConfig;
