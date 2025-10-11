# 🚀 Installation Guide - Advanced AI Agent

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- At least one API key (NVIDIA, SambaNova, or Cerebras)

## Quick Installation

```bash
# 1. Navigate to project directory
cd gamestart

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Edit .env and add your API keys
# Open .env in your editor and add:
# NVIDIA_API_KEY=your_key_here
# SAMBANOVA_API_KEY=your_key_here
# CEREBRAS_API_KEY=your_key_here

# 5. Start the server
npm start
```

## Detailed Installation Steps

### Step 1: Install Node.js

Download and install Node.js from https://nodejs.org/

Verify installation:
```bash
node --version  # Should be 18.0.0 or higher
npm --version
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Express.js for API server
- AI provider SDKs
- Code analysis tools
- And 20+ other dependencies

### Step 3: Get API Keys

#### NVIDIA API
1. Visit https://build.nvidia.com/
2. Sign up or log in
3. Navigate to API Keys
4. Generate new key
5. Copy the key

#### SambaNova API
1. Visit https://sambanova.ai/
2. Create account
3. Request API access
4. Get API key from dashboard

#### Cerebras API
1. Visit https://cerebras.ai/
2. Sign up for access
3. Get API key

### Step 4: Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```env
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxx
SAMBANOVA_API_KEY=your_sambanova_key
CEREBRAS_API_KEY=your_cerebras_key
```

**Note**: You need at least ONE API key to run the system.

### Step 5: Create Required Directories

```bash
mkdir -p logs data/cache data/temp data/vectors data/knowledge-base
```

### Step 6: Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Step 7: Verify Installation

Open browser and visit: http://localhost:3000

You should see:
```json
{
  "name": "Advanced AI Agent",
  "version": "1.0.0",
  "status": "running"
}
```

Test an endpoint:
```bash
curl http://localhost:3000/api/agent/health
```

## Optional: Database Setup

### MongoDB (Optional)
```bash
# Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod

# The system will auto-connect if MongoDB is running
```

### Redis (Optional)
```bash
# Install Redis
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server

# Start Redis
redis-server

# The system will auto-connect if Redis is running
```

**Note**: Databases are optional. The system works without them but with limited persistence.

## Docker Installation (Alternative)

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- AI Agent (port 3000)
- MongoDB (port 27017)
- Redis (port 6379)

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### API Key Not Working
- Verify key is correct (no extra spaces)
- Check if key has proper permissions
- Ensure API quota is not exceeded

### Permission Errors
```bash
# Windows: Run as Administrator
# Mac/Linux: Use sudo if needed
sudo npm install
```

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with API keys
- [ ] Directories created (logs, data)
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Can make API calls

## Next Steps

1. Read [QUICK_START.md](QUICK_START.md) for usage examples
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for all endpoints
3. Run example files in `examples/` folder
4. Start building with the AI agent!

## Support

- Check logs in `logs/app.log` for errors
- Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- Ensure API keys are valid and active

---

**Installation Complete! 🎉**

Your Advanced AI Agent is ready to use!
