#!/usr/bin/env node

// CLI tool for generating new nodes
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generateNode() {
  console.log('🚀 OpenFlow Node Generator\n');
  
  const nodeId = await question('Node ID (e.g., my-awesome-node): ');
  const nodeName = await question('Node Name (e.g., My Awesome Node): ');
  const description = await question('Description: ');
  const category = await question('Category (trigger|action|transform|etc.): ');
  const authorName = await question('Author Name: ');
  const authorEmail = await question('Author Email (optional): ');
  
  const template = `import { NodeBuilder, PortHelpers, PropertyHelpers } from '@openflow/sdk';

export const ${toCamelCase(nodeId)}Node = NodeBuilder
  .create('${nodeId}')
  .withName('${nodeName}')
  .withVersion('1.0.0')
  .withDescription('${description}')
  .withCategory('${category}')
  .withAuthor('${authorName}'${authorEmail ? `, '${authorEmail}'` : ''})
  .withIcon('⚡') // Choose your icon
  .withColor('#6366f1') // Choose your color
  
  // Define inputs
  .addInput(PortHelpers.input.any('input', 'Input Data'))
  
  // Define outputs
  .addOutput(PortHelpers.output.any('output', 'Output Data'))
  
  // Define properties/configuration
  .addProperty(PropertyHelpers.string('example', 'Example Property', 'default value'))
  
  // Define execution logic
  .withExecutor(async (context) => {
    const { inputs, properties, logger } = context;
    
    try {
      // Your node logic here
      logger.info('${nodeName} executing...');
      
      const result = inputs.input; // Transform your data
      
      return {
        outputs: {
          output: result
        }
      };
    } catch (error) {
      logger.error('Execution error', error);
      return {
        outputs: {},
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  })
  .build();

// Export for registration
export default ${toCamelCase(nodeId)}Node;
`;

  const filename = `${nodeId}.node.ts`;
  fs.writeFileSync(filename, template);
  
  console.log(`\n✅ Node generated: ${filename}`);
  console.log('\nNext steps:');
  console.log('1. Implement your node logic in the executor function');
  console.log('2. Test your node');
  console.log('3. Register your node with the registry');
  console.log('4. Publish to the OpenFlow marketplace');
  
  rl.close();
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Package.json template for node packages
const packageTemplate = {
  "name": "@openflow/node-{NODE_ID}",
  "version": "1.0.0",
  "description": "{DESCRIPTION}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublish": "npm run build"
  },
  "keywords": ["openflow", "workflow", "node"],
  "author": "{AUTHOR}",
  "license": "MIT",
  "peerDependencies": {
    "@openflow/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@openflow/sdk": "^1.0.0",
    "typescript": "^4.9.0",
    "@types/node": "^18.0.0",
    "jest": "^29.0.0"
  }
};

if (require.main === module) {
  generateNode().catch(console.error);
}

module.exports = { generateNode, packageTemplate };