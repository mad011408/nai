import { VM } from 'vm2';
import { spawn } from 'child_process';
import logger from '../../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

export class CodeExecutor {
  constructor() {
    this.timeout = 30000; // 30 seconds
    this.tempDir = './data/temp';
  }

  async executeJavaScript(code, options = {}) {
    try {
      logger.info('Executing JavaScript code in sandbox');

      const vm = new VM({
        timeout: options.timeout || this.timeout,
        sandbox: options.sandbox || {},
        eval: false,
        wasm: false
      });

      const startTime = Date.now();
      const result = vm.run(code);
      const duration = Date.now() - startTime;

      return {
        success: true,
        result: result,
        duration: duration,
        output: String(result)
      };
    } catch (error) {
      logger.error('JavaScript execution failed:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  async executeNode(code, options = {}) {
    try {
      // Write code to temp file
      const filename = `exec_${Date.now()}.js`;
      const filepath = path.join(this.tempDir, filename);
      
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.writeFile(filepath, code);

      const result = await this.runCommand('node', [filepath], options);

      // Cleanup
      await fs.unlink(filepath).catch(() => {});

      return result;
    } catch (error) {
      logger.error('Node execution failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executePython(code, options = {}) {
    try {
      const filename = `exec_${Date.now()}.py`;
      const filepath = path.join(this.tempDir, filename);
      
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.writeFile(filepath, code);

      const result = await this.runCommand('python', [filepath], options);

      await fs.unlink(filepath).catch(() => {});

      return result;
    } catch (error) {
      logger.error('Python execution failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const process = spawn(command, args, {
        timeout: options.timeout || this.timeout,
        cwd: options.cwd || this.tempDir
      });

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        const duration = Date.now() - startTime;

        resolve({
          success: code === 0,
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          duration: duration
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });

      // Timeout handler
      setTimeout(() => {
        process.kill();
        resolve({
          success: false,
          error: 'Execution timeout'
        });
      }, options.timeout || this.timeout);
    });
  }

  async executeWithTests(code, tests, options = {}) {
    try {
      // Execute main code
      const codeResult = await this.executeJavaScript(code, options);
      
      if (!codeResult.success) {
        return {
          success: false,
          error: 'Code execution failed',
          details: codeResult
        };
      }

      // Run tests
      const testResults = [];
      for (const test of tests) {
        const testCode = `
          ${code}
          ${test.code}
        `;
        const result = await this.executeJavaScript(testCode, options);
        testResults.push({
          name: test.name,
          passed: result.success && result.result === test.expected,
          result: result
        });
      }

      return {
        success: true,
        codeResult: codeResult,
        testResults: testResults,
        allTestsPassed: testResults.every(t => t.passed)
      };
    } catch (error) {
      logger.error('Execute with tests failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validateSyntax(code, language = 'javascript') {
    try {
      if (language === 'javascript') {
        // Try to parse without executing
        new Function(code);
        return { valid: true };
      }
      
      return { valid: true, message: 'Syntax validation not implemented for this language' };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  async benchmark(code, iterations = 100, options = {}) {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const result = await this.executeJavaScript(code, options);
      if (result.success) {
        results.push(result.duration);
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        error: 'All iterations failed'
      };
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);

    return {
      success: true,
      iterations: results.length,
      average: avg,
      min: min,
      max: max,
      results: results
    };
  }
}

export default new CodeExecutor();
