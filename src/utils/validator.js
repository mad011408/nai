import { SUPPORTED_LANGUAGES } from './constants.js';

export class Validator {
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message must be a non-empty string' };
    }
    if (message.length > 50000) {
      return { valid: false, error: 'Message too long (max 50000 characters)' };
    }
    return { valid: true };
  }

  static validateCode(code) {
    if (!code || typeof code !== 'string') {
      return { valid: false, error: 'Code must be a non-empty string' };
    }
    if (code.length > 100000) {
      return { valid: false, error: 'Code too long (max 100000 characters)' };
    }
    return { valid: true };
  }

  static validateLanguage(language) {
    if (!language) {
      return { valid: true }; // Optional field
    }
    if (!SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
      return { 
        valid: false, 
        error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` 
      };
    }
    return { valid: true };
  }

  static validateProvider(provider) {
    if (!provider) {
      return { valid: true }; // Optional field
    }
    const validProviders = ['nvidia', 'sambanova', 'cerebras'];
    if (!validProviders.includes(provider.toLowerCase())) {
      return { 
        valid: false, 
        error: `Invalid provider. Valid options: ${validProviders.join(', ')}` 
      };
    }
    return { valid: true };
  }

  static validateModel(model) {
    if (!model) {
      return { valid: true }; // Optional field
    }
    if (typeof model !== 'string') {
      return { valid: false, error: 'Model must be a string' };
    }
    return { valid: true };
  }

  static validateTemperature(temperature) {
    if (temperature === undefined || temperature === null) {
      return { valid: true }; // Optional field
    }
    const temp = parseFloat(temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      return { valid: false, error: 'Temperature must be between 0 and 2' };
    }
    return { valid: true };
  }

  static validateMaxTokens(maxTokens) {
    if (!maxTokens) {
      return { valid: true }; // Optional field
    }
    const tokens = parseInt(maxTokens);
    if (isNaN(tokens) || tokens < 1 || tokens > 32000) {
      return { valid: false, error: 'Max tokens must be between 1 and 32000' };
    }
    return { valid: true };
  }
}

export default Validator;
