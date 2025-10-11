import codingAgent from '../../core/agents/CodingAgent.js';
import aiEngine from '../../core/engine/AIEngine.js';
import modelOrchestrator from '../../core/engine/ModelOrchestrator.js';
import bugPredictor from '../../intelligence/prediction/BugPredictor.js';
import codeExecutor from '../../tools/execution/CodeExecutor.js';
import conversationMemory from '../../memory/short-term/ConversationMemory.js';
import logger from '../../utils/logger.js';

class AgentController {
  async chat(req, res) {
    try {
      const { message, conversationId, provider, model } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const convId = conversationId || `conv_${Date.now()}`;
      
      // Add user message to memory
      conversationMemory.addMessage(convId, {
        role: 'user',
        content: message
      });

      // Get conversation history
      const history = conversationMemory.getFormattedHistory(convId, 10);

      // Generate response
      const response = await aiEngine.generateResponse(message, {
        context: history,
        provider: provider,
        model: model
      });

      // Add assistant response to memory
      conversationMemory.addMessage(convId, {
        role: 'assistant',
        content: response.content
      });

      res.json({
        success: true,
        conversationId: convId,
        response: response.content,
        metadata: {
          provider: response.provider,
          model: response.model,
          duration: response.duration
        }
      });
    } catch (error) {
      logger.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async streamChat(req, res) {
    try {
      const { message, conversationId, provider, model } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const convId = conversationId || `conv_${Date.now()}`;
      const history = conversationMemory.getFormattedHistory(convId, 10);

      let fullResponse = '';

      await aiEngine.generateStreamResponse(
        message,
        { context: history, provider, model },
        (chunk) => {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      conversationMemory.addMessage(convId, {
        role: 'user',
        content: message
      });

      conversationMemory.addMessage(convId, {
        role: 'assistant',
        content: fullResponse
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      logger.error('Stream chat error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  async generateCode(req, res) {
    try {
      const { description, language, provider, model } = req.body;

      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }

      const result = await codingAgent.generateCode(
        description,
        language || 'javascript',
        { provider, model }
      );

      res.json(result);
    } catch (error) {
      logger.error('Generate code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async completeCode(req, res) {
    try {
      const { code, context, provider, model } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await codingAgent.completeCode(
        code,
        context || '',
        { provider, model }
      );

      res.json(result);
    } catch (error) {
      logger.error('Complete code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async analyzeCode(req, res) {
    try {
      const { code, analysisType, provider, model } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await codingAgent.analyzeCode(
        code,
        analysisType || 'full',
        { provider, model }
      );

      res.json(result);
    } catch (error) {
      logger.error('Analyze code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async predictBugs(req, res) {
    try {
      const { code, provider, model } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await bugPredictor.predict(code, { provider, model });

      res.json(result);
    } catch (error) {
      logger.error('Predict bugs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async refactorCode(req, res) {
    try {
      const { code, instructions, provider, model } = req.body;

      if (!code || !instructions) {
        return res.status(400).json({ error: 'Code and instructions are required' });
      }

      const result = await codingAgent.refactorCode(
        code,
        instructions,
        { provider, model }
      );

      res.json(result);
    } catch (error) {
      logger.error('Refactor code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async optimizeCode(req, res) {
    try {
      const { code, optimizationType, provider, model } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await codingAgent.optimizeCode(
        code,
        optimizationType || 'performance',
        { provider, model }
      );

      res.json(result);
    } catch (error) {
      logger.error('Optimize code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async debugCode(req, res) {
    try {
      const { code, error, provider, model } = req.body;

      if (!code || !error) {
        return res.status(400).json({ error: 'Code and error are required' });
      }

      const result = await codingAgent.debugCode(
        code,
        error,
        { provider, model }
      );

      res.json(result);
    } catch (error) {
      logger.error('Debug code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async generateTests(req, res) {
    try {
      const { code, framework, provider, model } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await codingAgent.generateTests(
        code,
        framework || 'jest',
        { provider, model }
      );

      res.json(result);
    } catch (error) {
      logger.error('Generate tests error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async executeCode(req, res) {
    try {
      const { code, language, tests } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      let result;
      if (tests && tests.length > 0) {
        result = await codeExecutor.executeWithTests(code, tests);
      } else if (language === 'python') {
        result = await codeExecutor.executePython(code);
      } else {
        result = await codeExecutor.executeJavaScript(code);
      }

      res.json(result);
    } catch (error) {
      logger.error('Execute code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getModels(req, res) {
    try {
      const providers = modelOrchestrator.getAvailableProviders();
      res.json({
        success: true,
        providers: providers
      });
    } catch (error) {
      logger.error('Get models error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCapabilities(req, res) {
    try {
      const capabilities = codingAgent.getCapabilities();
      res.json({
        success: true,
        capabilities: capabilities
      });
    } catch (error) {
      logger.error('Get capabilities error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async health(req, res) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}

export default new AgentController();
