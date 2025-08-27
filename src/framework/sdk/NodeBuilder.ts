import { NodeDefinition, PortDefinition, PropertyDefinition, NodeExecutor, NodeCategory } from '../core/NodeDefinition';

// Fluent API for building nodes
export class NodeBuilder {
  private definition: Partial<NodeDefinition> = {};

  static create(id: string): NodeBuilder {
    return new NodeBuilder().withId(id);
  }

  withId(id: string): NodeBuilder {
    this.definition.id = id;
    return this;
  }

  withName(name: string): NodeBuilder {
    this.definition.name = name;
    return this;
  }

  withVersion(version: string): NodeBuilder {
    this.definition.version = version;
    return this;
  }

  withDescription(description: string): NodeBuilder {
    this.definition.description = description;
    return this;
  }

  withCategory(category: NodeCategory): NodeBuilder {
    this.definition.category = category;
    return this;
  }

  withAuthor(name: string, email?: string, github?: string): NodeBuilder {
    this.definition.author = { name, email, github };
    return this;
  }

  withIcon(icon: string): NodeBuilder {
    this.definition.icon = icon;
    return this;
  }

  withColor(color: string): NodeBuilder {
    this.definition.color = color;
    return this;
  }

  addInput(port: PortDefinition): NodeBuilder {
    if (!this.definition.inputs) this.definition.inputs = [];
    this.definition.inputs.push(port);
    return this;
  }

  addOutput(port: PortDefinition): NodeBuilder {
    if (!this.definition.outputs) this.definition.outputs = [];
    this.definition.outputs.push(port);
    return this;
  }

  addProperty(property: PropertyDefinition): NodeBuilder {
    if (!this.definition.properties) this.definition.properties = [];
    this.definition.properties.push(property);
    return this;
  }

  withExecutor(executor: NodeExecutor): NodeBuilder {
    this.definition.execute = executor;
    return this;
  }

  withDependencies(dependencies: string[]): NodeBuilder {
    this.definition.dependencies = dependencies;
    return this;
  }

  requiresCredentials(credentials: string[]): NodeBuilder {
    if (!this.definition.requirements) this.definition.requirements = {};
    this.definition.requirements.credentials = credentials;
    return this;
  }

  build(): NodeDefinition {
    // Validate required fields
    if (!this.definition.id) throw new Error('Node ID is required');
    if (!this.definition.name) throw new Error('Node name is required');
    if (!this.definition.version) throw new Error('Node version is required');
    if (!this.definition.execute) throw new Error('Node executor is required');

    // Set defaults
    return {
      inputs: [],
      outputs: [],
      properties: [],
      icon: '⚡',
      color: '#6366f1',
      description: '',
      category: 'utility',
      author: { name: 'Unknown' },
      ...this.definition
    } as NodeDefinition;
  }
}

// Helper functions for common port/property types
export const PortHelpers = {
  input: {
    any: (id: string, name: string, required = true): PortDefinition => ({
      id, name, type: 'any', required, description: `${name} input`
    }),
    string: (id: string, name: string, required = true): PortDefinition => ({
      id, name, type: 'string', required, description: `${name} input`
    }),
    number: (id: string, name: string, required = true): PortDefinition => ({
      id, name, type: 'number', required, description: `${name} input`
    }),
    object: (id: string, name: string, required = true): PortDefinition => ({
      id, name, type: 'object', required, description: `${name} input`
    })
  },
  output: {
    any: (id: string, name: string): PortDefinition => ({
      id, name, type: 'any', required: false, description: `${name} output`
    }),
    string: (id: string, name: string): PortDefinition => ({
      id, name, type: 'string', required: false, description: `${name} output`
    }),
    number: (id: string, name: string): PortDefinition => ({
      id, name, type: 'number', required: false, description: `${name} output`
    }),
    object: (id: string, name: string): PortDefinition => ({
      id, name, type: 'object', required: false, description: `${name} output`
    })
  }
};

export const PropertyHelpers = {
  string: (id: string, name: string, defaultValue = '', required = false): PropertyDefinition => ({
    id, name, type: 'string', required, default: defaultValue, description: name
  }),
  number: (id: string, name: string, defaultValue = 0, required = false): PropertyDefinition => ({
    id, name, type: 'number', required, default: defaultValue, description: name
  }),
  boolean: (id: string, name: string, defaultValue = false, required = false): PropertyDefinition => ({
    id, name, type: 'boolean', required, default: defaultValue, description: name
  }),
  select: (id: string, name: string, options: Array<{label: string, value: any}>, defaultValue?: any): PropertyDefinition => ({
    id, name, type: 'select', required: false, default: defaultValue, options, description: name
  }),
  code: (id: string, name: string, defaultValue = '', required = false): PropertyDefinition => ({
    id, name, type: 'code', required, default: defaultValue, description: name
  })
};