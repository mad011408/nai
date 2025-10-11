import logger from '../../utils/logger.js';

export class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.loadDefaultTemplates();
  }

  loadDefaultTemplates() {
    // Express API Template
    this.templates.set('express-api', {
      language: 'javascript',
      template: `import express from 'express';
const router = express.Router();

{{routes}}

export default router;`
    });

    // React Component Template
    this.templates.set('react-component', {
      language: 'jsx',
      template: `import React from 'react';

export const {{componentName}} = ({{props}}) => {
  {{hooks}}

  return (
    <div>
      {{content}}
    </div>
  );
};`
    });

    // Node.js Service Template
    this.templates.set('node-service', {
      language: 'javascript',
      template: `export class {{serviceName}} {
  constructor() {
    {{initialization}}
  }

  {{methods}}
}`
    });

    // Test Template
    this.templates.set('jest-test', {
      language: 'javascript',
      template: `import { {{functionName}} } from './{{fileName}}';

describe('{{functionName}}', () => {
  {{testCases}}
});`
    });
  }

  render(templateName, variables) {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    let rendered = template.template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }

    return rendered;
  }

  registerTemplate(name, template) {
    this.templates.set(name, template);
    logger.info(`Template registered: ${name}`);
  }

  getTemplate(name) {
    return this.templates.get(name);
  }

  listTemplates() {
    return Array.from(this.templates.keys());
  }

  generateFromTemplate(templateName, variables) {
    try {
      const code = this.render(templateName, variables);
      return {
        success: true,
        code: code,
        template: templateName
      };
    } catch (error) {
      logger.error('Template generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new TemplateEngine();
