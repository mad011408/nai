// Advanced Usage Examples for Advanced AI Agent

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/agent';

// Example 1: Multi-turn Conversation with Context
async function conversationWithContext() {
  console.log('=== Multi-turn Conversation ===');
  
  let conversationId;
  
  // First message
  const response1 = await axios.post(`${API_BASE}/chat`, {
    message: 'I need to create a user authentication system'
  });
  conversationId = response1.data.conversationId;
  console.log('AI:', response1.data.response);
  
  // Follow-up with context
  const response2 = await axios.post(`${API_BASE}/chat`, {
    message: 'Now add JWT token support',
    conversationId: conversationId
  });
  console.log('AI:', response2.data.response);
  
  // Another follow-up
  const response3 = await axios.post(`${API_BASE}/chat`, {
    message: 'Add password hashing with bcrypt',
    conversationId: conversationId
  });
  console.log('AI:', response3.data.response);
}

// Example 2: Using Different Providers and Models
async function multiProviderExample() {
  console.log('\n=== Multi-Provider Example ===');
  
  const description = 'Create a binary search algorithm';
  
  // Try NVIDIA
  const nvidia = await axios.post(`${API_BASE}/code/generate`, {
    description,
    provider: 'nvidia',
    model: 'deepseek-ai/deepseek-v3.1'
  });
  console.log('NVIDIA Result:', nvidia.data.code);
  
  // Try Cerebras
  const cerebras = await axios.post(`${API_BASE}/code/generate`, {
    description,
    provider: 'cerebras',
    model: 'qwen-3-coder-480b'
  });
  console.log('Cerebras Result:', cerebras.data.code);
  
  // Compare performance
  console.log('NVIDIA Duration:', nvidia.data.metadata.duration, 'ms');
  console.log('Cerebras Duration:', cerebras.data.metadata.duration, 'ms');
}

// Example 3: Complex Code Analysis Pipeline
async function analysisPipeline() {
  console.log('\n=== Analysis Pipeline ===');
  
  const code = `
import express from 'express';
const app = express();

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM users WHERE id = " + userId;
  db.query(query, (err, result) => {
    res.send(result);
  });
});
  `;
  
  // Step 1: Full Analysis
  const analysis = await axios.post(`${API_BASE}/code/analyze`, {
    code,
    analysisType: 'full'
  });
  console.log('Full Analysis:', analysis.data);
  
  // Step 2: Security Analysis
  const security = await axios.post(`${API_BASE}/code/analyze`, {
    code,
    analysisType: 'security'
  });
  console.log('Security Issues:', security.data.issues);
  
  // Step 3: Bug Prediction
  const bugs = await axios.post(`${API_BASE}/code/predict-bugs`, {
    code
  });
  console.log('Predicted Bugs:', bugs.data.predictions);
  
  // Step 4: Get Fix Recommendations
  if (bugs.data.predictions.length > 0) {
    const fix = await axios.post(`${API_BASE}/code/refactor`, {
      code,
      instructions: 'Fix all security vulnerabilities and bugs'
    });
    console.log('Fixed Code:', fix.data.refactoredCode);
  }
}

// Example 4: Automated Code Generation with Validation
async function generateAndValidate() {
  console.log('\n=== Generate and Validate ===');
  
  // Generate code
  const generated = await axios.post(`${API_BASE}/code/generate`, {
    description: 'Create a function to validate credit card numbers using Luhn algorithm',
    language: 'javascript'
  });
  
  const code = generated.data.code;
  console.log('Generated Code:', code);
  
  // Analyze generated code
  const analysis = await axios.post(`${API_BASE}/code/analyze`, {
    code,
    analysisType: 'full'
  });
  console.log('Analysis:', analysis.data);
  
  // Generate tests
  const tests = await axios.post(`${API_BASE}/code/generate-tests`, {
    code,
    framework: 'jest'
  });
  console.log('Generated Tests:', tests.data.tests);
  
  // Execute code with test cases
  const testCode = `
${code}

// Test cases
console.log(validateCreditCard('4532015112830366')); // Valid
console.log(validateCreditCard('1234567890123456')); // Invalid
  `;
  
  const execution = await axios.post(`${API_BASE}/code/execute`, {
    code: testCode
  });
  console.log('Test Results:', execution.data);
}

// Example 5: Code Optimization with Benchmarking
async function optimizeAndBenchmark() {
  console.log('\n=== Optimize and Benchmark ===');
  
  const originalCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
  `;
  
  // Optimize for performance
  const optimized = await axios.post(`${API_BASE}/code/optimize`, {
    code: originalCode,
    optimizationType: 'performance'
  });
  
  console.log('Optimized Code:', optimized.data.optimizedCode);
  console.log('Improvements:', optimized.data.improvements);
  
  // Benchmark both versions
  const benchmark1 = await axios.post(`${API_BASE}/code/execute`, {
    code: `
${originalCode}
const start = Date.now();
fibonacci(30);
const duration = Date.now() - start;
duration;
    `
  });
  
  const benchmark2 = await axios.post(`${API_BASE}/code/execute`, {
    code: `
${optimized.data.optimizedCode}
const start = Date.now();
fibonacci(30);
const duration = Date.now() - start;
duration;
    `
  });
  
  console.log('Original Duration:', benchmark1.data.result, 'ms');
  console.log('Optimized Duration:', benchmark2.data.result, 'ms');
}

// Example 6: Batch Processing
async function batchProcessing() {
  console.log('\n=== Batch Processing ===');
  
  const codeSnippets = [
    'function add(a, b) { return a + b; }',
    'const multiply = (x, y) => x * y;',
    'function divide(a, b) { return a / b; }'
  ];
  
  const results = await Promise.all(
    codeSnippets.map(code => 
      axios.post(`${API_BASE}/code/analyze`, { code, analysisType: 'quality' })
    )
  );
  
  results.forEach((result, index) => {
    console.log(`Snippet ${index + 1}:`, result.data.analysis);
  });
}

// Example 7: Real-time Code Assistance
async function realtimeAssistance() {
  console.log('\n=== Real-time Code Assistance ===');
  
  // Simulate typing code
  const partialCode = 'async function fetchData(url) {';
  
  // Get completion
  const completion = await axios.post(`${API_BASE}/code/complete`, {
    code: partialCode,
    context: 'Fetch data from API with error handling and retry logic'
  });
  
  console.log('Suggested Completion:', completion.data.completion);
  
  // Get inline suggestions
  const fullCode = partialCode + completion.data.completion;
  
  // Analyze as user types
  const quickAnalysis = await axios.post(`${API_BASE}/code/predict-bugs`, {
    code: fullCode
  });
  
  console.log('Real-time Warnings:', quickAnalysis.data.predictions);
}

// Example 8: Custom Temperature and Parameters
async function customParameters() {
  console.log('\n=== Custom Parameters ===');
  
  const description = 'Create a creative solution for rate limiting';
  
  // High temperature for creativity
  const creative = await axios.post(`${API_BASE}/code/generate`, {
    description,
    temperature: 0.9,
    maxTokens: 2000
  });
  console.log('Creative Solution:', creative.data.code);
  
  // Low temperature for precision
  const precise = await axios.post(`${API_BASE}/code/generate`, {
    description,
    temperature: 0.1,
    maxTokens: 2000
  });
  console.log('Precise Solution:', precise.data.code);
}

// Example 9: Error Handling and Retry
async function errorHandlingExample() {
  console.log('\n=== Error Handling ===');
  
  try {
    // Intentionally invalid request
    await axios.post(`${API_BASE}/code/generate`, {
      description: '' // Empty description
    });
  } catch (error) {
    console.log('Error caught:', error.response?.data?.error);
    
    // Retry with valid data
    const retry = await axios.post(`${API_BASE}/code/generate`, {
      description: 'Create a simple hello world function'
    });
    console.log('Retry successful:', retry.data.code);
  }
}

// Example 10: Full Development Workflow
async function fullWorkflow() {
  console.log('\n=== Full Development Workflow ===');
  
  // 1. Generate initial code
  const generated = await axios.post(`${API_BASE}/code/generate`, {
    description: 'Create a REST API endpoint for user registration',
    language: 'javascript'
  });
  let code = generated.data.code;
  console.log('Step 1 - Generated:', code);
  
  // 2. Analyze for issues
  const analysis = await axios.post(`${API_BASE}/code/analyze`, {
    code,
    analysisType: 'full'
  });
  console.log('Step 2 - Analysis:', analysis.data.issues);
  
  // 3. Predict bugs
  const bugs = await axios.post(`${API_BASE}/code/predict-bugs`, { code });
  console.log('Step 3 - Bugs:', bugs.data.predictions);
  
  // 4. Refactor if needed
  if (bugs.data.predictions.length > 0) {
    const refactored = await axios.post(`${API_BASE}/code/refactor`, {
      code,
      instructions: 'Fix all issues and improve code quality'
    });
    code = refactored.data.refactoredCode;
    console.log('Step 4 - Refactored:', code);
  }
  
  // 5. Optimize
  const optimized = await axios.post(`${API_BASE}/code/optimize`, {
    code,
    optimizationType: 'performance'
  });
  code = optimized.data.optimizedCode;
  console.log('Step 5 - Optimized:', code);
  
  // 6. Generate tests
  const tests = await axios.post(`${API_BASE}/code/generate-tests`, {
    code,
    framework: 'jest'
  });
  console.log('Step 6 - Tests:', tests.data.tests);
  
  console.log('\n✅ Full workflow completed!');
}

// Run advanced examples
async function runAdvancedExamples() {
  try {
    await conversationWithContext();
    await multiProviderExample();
    await analysisPipeline();
    await generateAndValidate();
    await optimizeAndBenchmark();
    await batchProcessing();
    await realtimeAssistance();
    await customParameters();
    await errorHandlingExample();
    await fullWorkflow();
    
    console.log('\n✅ All advanced examples completed!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run examples
runAdvancedExamples();
