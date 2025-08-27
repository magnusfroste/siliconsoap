import { NodeDefinition } from './NodeDefinition';

export class NodeRegistry {
  private nodes = new Map<string, NodeDefinition>();
  private categories = new Map<string, NodeDefinition[]>();

  // Register a new node
  register(node: NodeDefinition): void {
    // Validate node definition
    this.validateNode(node);
    
    // Store node
    this.nodes.set(node.id, node);
    
    // Update category index
    const categoryNodes = this.categories.get(node.category) || [];
    categoryNodes.push(node);
    this.categories.set(node.category, categoryNodes);
    
    console.log(`Registered node: ${node.name} (${node.id})`);
  }

  // Get node by ID
  getNode(id: string): NodeDefinition | undefined {
    return this.nodes.get(id);
  }

  // Get all nodes
  getAllNodes(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  // Get nodes by category
  getNodesByCategory(category: string): NodeDefinition[] {
    return this.categories.get(category) || [];
  }

  // Search nodes
  searchNodes(query: string): NodeDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllNodes().filter(node => 
      node.name.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Get available categories
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  // Validate node definition
  private validateNode(node: NodeDefinition): void {
    if (!node.id) throw new Error('Node ID is required');
    if (!node.name) throw new Error('Node name is required');
    if (!node.version) throw new Error('Node version is required');
    if (!node.execute) throw new Error('Node execute function is required');
    
    // Check for duplicate IDs
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with ID '${node.id}' already exists`);
    }
    
    // Validate semantic version
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(node.version)) {
      throw new Error('Node version must follow semantic versioning (x.y.z)');
    }
  }

  // Unregister a node
  unregister(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    
    this.nodes.delete(id);
    
    // Remove from category
    const categoryNodes = this.categories.get(node.category) || [];
    const updatedNodes = categoryNodes.filter(n => n.id !== id);
    this.categories.set(node.category, updatedNodes);
    
    return true;
  }

  // Get node statistics
  getStats() {
    return {
      totalNodes: this.nodes.size,
      categoryCounts: Object.fromEntries(
        Array.from(this.categories.entries()).map(([cat, nodes]) => [cat, nodes.length])
      )
    };
  }
}

// Global registry instance
export const nodeRegistry = new NodeRegistry();