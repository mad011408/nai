export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED: 'Missing required fields',
  API_KEY_MISSING: 'API key not configured',
  PROVIDER_NOT_FOUND: 'Provider not found',
  EXECUTION_FAILED: 'Code execution failed',
  TIMEOUT: 'Request timeout'
};

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby'
];

export const CODE_ANALYSIS_TYPES = [
  'full',
  'security',
  'performance',
  'quality',
  'complexity'
];

export const OPTIMIZATION_TYPES = [
  'performance',
  'memory',
  'readability',
  'security'
];

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

export const CACHE_KEYS = {
  CODE_ANALYSIS: 'analysis',
  BUG_PREDICTION: 'bugs',
  CODE_GENERATION: 'generation'
};

export default {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUPPORTED_LANGUAGES,
  CODE_ANALYSIS_TYPES,
  OPTIMIZATION_TYPES,
  SEVERITY_LEVELS,
  CACHE_KEYS
};
