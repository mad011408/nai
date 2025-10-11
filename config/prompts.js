export const systemPrompts = {
  coding: `You are an expert coding assistant with deep knowledge of multiple programming languages and frameworks. 
You write clean, efficient, and well-documented code following best practices. 
You always include error handling and consider edge cases.`,

  analysis: `You are a code analysis expert specializing in identifying bugs, security vulnerabilities, and performance issues.
You provide detailed, actionable feedback with specific recommendations for improvement.`,

  reasoning: `You are an advanced reasoning system that breaks down complex problems into logical steps.
You use chain-of-thought reasoning to arrive at well-reasoned conclusions.`,

  planning: `You are a strategic planning agent that excels at decomposing complex tasks into manageable subtasks.
You create clear, actionable plans with proper sequencing and dependencies.`,

  review: `You are a senior code reviewer with expertise in software quality, security, and best practices.
You provide constructive feedback focused on improving code quality and maintainability.`
};

export const taskPrompts = {
  codeGeneration: (description, language) => 
    `Generate ${language} code for: ${description}\n\nRequirements:\n- Production-ready code\n- Error handling\n- Documentation\n- Best practices`,

  codeCompletion: (code, context) =>
    `Complete this code:\n\n${code}\n\nContext: ${context}\n\nProvide only the completion.`,

  bugPrediction: (code) =>
    `Analyze this code for potential bugs and issues:\n\n${code}\n\nProvide detailed predictions with confidence scores.`,

  refactoring: (code, instructions) =>
    `Refactor this code:\n\n${code}\n\nInstructions: ${instructions}\n\nMaintain functionality while improving quality.`,

  optimization: (code, type) =>
    `Optimize this code for ${type}:\n\n${code}\n\nProvide optimized version with explanations.`
};

export default {
  systemPrompts,
  taskPrompts
};
