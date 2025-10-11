import astParser from './ASTParser.js';
import logger from '../../utils/logger.js';

export class DependencyAnalyzer {
  constructor() {
    this.parser = astParser;
  }

  async analyze(code, options = {}) {
    logger.info('Analyzing dependencies');

    try {
      const parsed = this.parser.parse(code);
      const dependencies = this.parser.findDependencies(parsed.ast);

      return {
        success: true,
        dependencies: dependencies,
        count: dependencies.length,
        types: this.categorizeDependencies(dependencies),
        graph: this.buildDependencyGraph(dependencies)
      };
    } catch (error) {
      logger.error('Dependency analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  categorizeDependencies(dependencies) {
    const types = {
      external: [],
      internal: [],
      builtin: []
    };

    const builtinModules = ['fs', 'path', 'http', 'https', 'crypto', 'util', 'events'];

    for (const dep of dependencies) {
      if (builtinModules.includes(dep)) {
        types.builtin.push(dep);
      } else if (dep.startsWith('.') || dep.startsWith('/')) {
        types.internal.push(dep);
      } else {
        types.external.push(dep);
      }
    }

    return types;
  }

  buildDependencyGraph(dependencies) {
    const graph = {
      nodes: dependencies.map(dep => ({ id: dep, label: dep })),
      edges: []
    };

    return graph;
  }

  async findCircularDependencies(codebase) {
    logger.info('Checking for circular dependencies');

    const graph = new Map();
    
    // Build dependency graph
    for (const [file, code] of Object.entries(codebase)) {
      const analysis = await this.analyze(code);
      graph.set(file, analysis.dependencies);
    }

    // Detect cycles
    const cycles = this.detectCycles(graph);

    return {
      success: true,
      hasCycles: cycles.length > 0,
      cycles: cycles
    };
  }

  detectCycles(graph) {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, [...path]);
      }

      recursionStack.delete(node);
    };

    for (const node of graph.keys()) {
      dfs(node);
    }

    return cycles;
  }
}

export default new DependencyAnalyzer();
