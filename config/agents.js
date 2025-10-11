export const agentConfig = {
  coding: {
    name: 'CodingAgent',
    capabilities: [
      'code_generation',
      'code_completion',
      'code_analysis',
      'debugging',
      'refactoring',
      'optimization'
    ],
    defaultProvider: 'cerebras',
    defaultModel: 'qwen-3-coder-480b',
    temperature: 0.3,
    maxTokens: 8000
  },

  reasoning: {
    name: 'ReasoningAgent',
    capabilities: [
      'chain_of_thought',
      'tree_of_thought',
      'problem_solving',
      'logical_reasoning'
    ],
    defaultProvider: 'nvidia',
    defaultModel: 'qwen/qwen3-next-80b-a3b-thinking',
    temperature: 0.7,
    maxTokens: 4000
  },

  planning: {
    name: 'PlanningAgent',
    capabilities: [
      'task_decomposition',
      'goal_setting',
      'strategy_selection',
      'execution_planning'
    ],
    defaultProvider: 'nvidia',
    defaultModel: 'deepseek-ai/deepseek-v3.1',
    temperature: 0.5,
    maxTokens: 4000
  },

  execution: {
    name: 'ExecutionAgent',
    capabilities: [
      'code_execution',
      'task_execution',
      'workflow_execution'
    ],
    defaultProvider: 'cerebras',
    defaultModel: 'qwen-3-32b',
    temperature: 0.2,
    maxTokens: 2000
  },

  review: {
    name: 'ReviewAgent',
    capabilities: [
      'code_review',
      'quality_assessment',
      'security_review',
      'performance_review'
    ],
    defaultProvider: 'nvidia',
    defaultModel: 'deepseek-ai/deepseek-v3.1',
    temperature: 0.3,
    maxTokens: 4000
  }
};

export function getAgentConfig(agentType) {
  return agentConfig[agentType] || agentConfig.coding;
}

export default agentConfig;
