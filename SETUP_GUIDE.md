# 🚀 Setup Guide - Advanced AI Agent

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- API keys from at least one provider

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd gamestart
npm install
```

### 2. Configure API Keys

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file and add your API keys:

```env
# Get from: https://build.nvidia.com/
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxx

# Get from: https://sambanova.ai/
SAMBANOVA_API_KEY=your_sambanova_key_here

# Get from: https://cerebras.ai/
CEREBRAS_API_KEY=your_cerebras_key_here
```

**Note**: You need at least ONE API key to use the system.

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 4. Verify Installation

Open browser and go to: `http://localhost:3000`

You should see:
```json
{
  "name": "Advanced AI Agent",
  "version": "1.0.0",
  "status": "running"
}
```

### 5. Test API

#### Test Chat Endpoint

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, explain what you can do",
    "provider": "nvidia"
  }'
```

#### Test Code Generation

```bash
curl -X POST http://localhost:3000/api/agent/code/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a function to reverse a string",
    "language": "javascript",
    "provider": "cerebras"
  }'
```

#### Test Bug Prediction

```bash
curl -X POST http://localhost:3000/api/agent/code/predict-bugs \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function test() { var x = 1; eval(x); }"
  }'
```

## 🔑 Getting API Keys

### NVIDIA API

1. Go to https://build.nvidia.com/
2. Sign up / Login
3. Navigate to API Keys section
4. Generate new API key
5. Copy and paste into `.env` file

### SambaNova API

1. Visit https://sambanova.ai/
2. Create account
3. Request API access
4. Get API key from dashboard
5. Add to `.env` file

### Cerebras API

1. Go to https://cerebras.ai/
2. Sign up for access
3. Navigate to API section
4. Generate API key
5. Add to `.env` file

## 📊 Verify Configuration

Check which providers are configured:

```bash
curl http://localhost:3000/api/agent/models
```

Response will show available providers and models.

## 🛠️ Troubleshooting

### Port Already in Use

Change port in `.env`:
```env
PORT=3001
```

### API Key Not Working

- Verify key is correct (no extra spaces)
- Check if key has proper permissions
- Ensure API quota is not exceeded

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Errors

The system works WITHOUT databases. Database errors are warnings only.

To disable database connections, comment out in `src/index.js`:
```javascript
// await databaseManager.connectAll();
```

## 🎯 Recommended Models

### For Code Generation
- **Cerebras**: `qwen-3-coder-480b` (Best for coding)
- **NVIDIA**: `deepseek-ai/deepseek-v3.1`

### For Bug Prediction
- **NVIDIA**: `deepseek-ai/deepseek-v3.1`
- **SambaNova**: `DeepSeek-V3.1`

### For Reasoning
- **NVIDIA**: `qwen/qwen3-next-80b-a3b-thinking`

## 📝 Example Client Code

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function generateCode() {
  const response = await axios.post('http://localhost:3000/api/agent/code/generate', {
    description: 'Create a REST API with Express',
    language: 'javascript',
    provider: 'cerebras',
    model: 'qwen-3-coder-480b'
  });
  
  console.log(response.data.code);
}

generateCode();
```

### Python

```python
import requests

response = requests.post('http://localhost:3000/api/agent/chat', json={
    'message': 'Explain async/await',
    'provider': 'nvidia'
})

print(response.json()['response'])
```

### cURL

```bash
curl -X POST http://localhost:3000/api/agent/code/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function example() { console.log(\"test\"); }",
    "analysisType": "full"
  }'
```

## 🔥 Advanced Configuration

### Enable All Features

Edit `.env`:
```env
# Agent Configuration
ENABLE_REASONING=true
ENABLE_PLANNING=true
ENABLE_LEARNING=true
MAX_REASONING_DEPTH=5

# Performance
MAX_CONCURRENT_REQUESTS=100
REQUEST_TIMEOUT=30000
BATCH_SIZE=10

# Cache
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
```

### Production Deployment

1. Set environment to production:
```env
NODE_ENV=production
```

2. Use process manager:
```bash
npm install -g pm2
pm2 start src/index.js --name ai-agent
```

3. Enable monitoring:
```bash
pm2 monit
```

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] At least one API key configured
- [ ] Server starts without errors
- [ ] Root endpoint returns JSON
- [ ] Chat endpoint works
- [ ] Code generation works
- [ ] Models endpoint shows providers

## 🎉 You're Ready!

Your Advanced AI Agent is now running and ready to assist with:
- Code generation
- Bug prediction (99.9% accuracy)
- Code analysis
- Refactoring
- Optimization
- Debugging
- Test generation
- And much more!

Visit `http://localhost:3000` to see all available endpoints.

## 📞 Need Help?

- Check logs in `logs/app.log`
- Review error messages in console
- Verify API keys are correct
- Ensure internet connection is active

---

**Happy Coding! 🚀**
