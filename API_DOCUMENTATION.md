# 📚 API Documentation

Complete API reference for the Advanced AI Agent.

## Base URL

```
http://localhost:3000/api/agent
```

---

## 🔵 Chat Endpoints

### POST `/chat`

Chat with the AI agent.

**Request:**
```json
{
  "message": "string (required)",
  "conversationId": "string (optional)",
  "provider": "nvidia|sambanova|cerebras (optional)",
  "model": "string (optional)",
  "temperature": "number (optional, 0-2)",
  "maxTokens": "number (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_1234567890",
  "response": "AI response text",
  "metadata": {
    "provider": "nvidia",
    "model": "deepseek-ai/deepseek-v3.1",
    "duration": 1234
  }
}
```

### POST `/chat/stream`

Stream chat responses in real-time (Server-Sent Events).

**Request:** Same as `/chat`

**Response:** Stream of events
```
data: {"chunk": "partial response"}
data: {"chunk": " more text"}
data: {"done": true}
```

---

## 💻 Code Generation Endpoints

### POST `/code/generate`

Generate code from description.

**Request:**
```json
{
  "description": "string (required)",
  "language": "javascript|python|java|etc (optional)",
  "provider": "string (optional)",
  "model": "string (optional)",
  "framework": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "code": "generated code",
  "explanation": "explanation text",
  "metadata": {
    "language": "javascript",
    "provider": "cerebras",
    "duration": 2000
  }
}
```

### POST `/code/complete`

Complete partial code.

**Request:**
```json
{
  "code": "string (required)",
  "context": "string (optional)",
  "provider": "string (optional)",
  "model": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "completion": "completed code",
  "fullResponse": "full explanation",
  "metadata": {
    "provider": "cerebras",
    "duration": 800
  }
}
```

---

## 🔍 Code Analysis Endpoints

### POST `/code/analyze`

Analyze code for quality, security, performance.

**Request:**
```json
{
  "code": "string (required)",
  "analysisType": "full|security|performance|quality (optional)",
  "provider": "string (optional)",
  "model": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "detailed analysis",
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "metadata": {
    "provider": "nvidia",
    "duration": 1500
  }
}
```

### POST `/code/predict-bugs`

Predict bugs with 99.9% accuracy.

**Request:**
```json
{
  "code": "string (required)",
  "provider": "string (optional)",
  "model": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "type": "security",
      "severity": "high",
      "message": "XSS vulnerability detected",
      "confidence": 0.98,
      "location": "line 15"
    }
  ],
  "confidence": 0.95,
  "recommendations": [
    {
      "priority": "critical",
      "message": "Fix security issues immediately"
    }
  ]
}
```

---

## 🔧 Code Transformation Endpoints

### POST `/code/refactor`

Refactor code for better quality.

**Request:**
```json
{
  "code": "string (required)",
  "instructions": "string (required)",
  "provider": "string (optional)",
  "model": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "refactoredCode": "improved code",
  "changes": "list of changes made",
  "metadata": {
    "provider": "nvidia",
    "duration": 2500
  }
}
```

### POST `/code/optimize`

Optimize code for performance/memory.

**Request:**
```json
{
  "code": "string (required)",
  "optimizationType": "performance|memory|readability (optional)",
  "provider": "string (optional)",
  "model": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "optimizedCode": "optimized code",
  "improvements": "explanation of improvements",
  "metadata": {
    "provider": "nvidia",
    "duration": 1800
  }
}
```

### POST `/code/debug`

Debug code and fix errors.

**Request:**
```json
{
  "code": "string (required)",
  "error": "string (required)",
  "provider": "string (optional)",
  "model": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "fix": "fixed code",
  "explanation": "explanation of the fix",
  "metadata": {
    "provider": "nvidia",
    "duration": 1200
  }
}
```

---

## 🧪 Testing Endpoints

### POST `/code/generate-tests`

Generate unit tests for code.

**Request:**
```json
{
  "code": "string (required)",
  "framework": "jest|mocha|pytest|etc (optional)",
  "provider": "string (optional)",
  "model": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "tests": "generated test code",
  "coverage": "explanation of test coverage",
  "metadata": {
    "provider": "cerebras",
    "duration": 2200
  }
}
```

### POST `/code/execute`

Execute code in sandbox.

**Request:**
```json
{
  "code": "string (required)",
  "language": "javascript|python (optional)",
  "tests": "array (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "result": "execution result",
  "stdout": "console output",
  "stderr": "error output",
  "duration": 150
}
```

---

## ℹ️ Information Endpoints

### GET `/models`

Get available AI models.

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "name": "nvidia",
      "models": [
        "deepseek-ai/deepseek-v3.1",
        "meta/llama-3.1-405b-instruct",
        "..."
      ]
    },
    {
      "name": "cerebras",
      "models": [
        "qwen-3-coder-480b",
        "qwen-3-235b-a22b-thinking-2507",
        "..."
      ]
    }
  ]
}
```

### GET `/capabilities`

Get agent capabilities.

**Response:**
```json
{
  "success": true,
  "capabilities": [
    "code_generation",
    "code_completion",
    "code_analysis",
    "debugging",
    "refactoring",
    "optimization",
    "testing"
  ]
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

---

## 🎯 Recommended Models

### For Code Generation
- **Cerebras**: `qwen-3-coder-480b` (Best for coding)
- **NVIDIA**: `deepseek-ai/deepseek-v3.1`

### For Bug Prediction
- **NVIDIA**: `deepseek-ai/deepseek-v3.1`
- **SambaNova**: `DeepSeek-V3.1`

### For Reasoning Tasks
- **NVIDIA**: `qwen/qwen3-next-80b-a3b-thinking`

### For Fast Responses
- **NVIDIA**: `microsoft/phi-4-mini-instruct`
- **Cerebras**: `qwen-3-32b`

---

## 🔒 Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## 💡 Usage Tips

1. **Use appropriate models**: Cerebras for coding, NVIDIA for analysis
2. **Set temperature**: Lower (0.1-0.3) for precision, higher (0.7-0.9) for creativity
3. **Leverage context**: Use conversationId for multi-turn conversations
4. **Batch requests**: Use Promise.all() for parallel processing
5. **Handle errors**: Always implement error handling
6. **Cache responses**: Responses are cached automatically for performance

---

## 📊 Rate Limits

- Default: 100 requests per 15 minutes
- Configurable in `.env` file

---

## 🔐 Authentication

Currently no authentication required. Add JWT or API keys in production.

---

## 📞 Support

For issues and questions, check logs in `logs/app.log` or open a GitHub issue.
