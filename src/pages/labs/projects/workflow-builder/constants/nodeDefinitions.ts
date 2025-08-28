import { NodeDefinition, NodeType, NodeCategory } from '../types';

// n8n-inspirerad färgpalett för olika node kategorier
export const NODE_COLORS = {
  [NodeCategory.TRIGGERS]: '#FF6B6B',    // Röd/orange för triggers
  [NodeCategory.ACTIONS]: '#4ECDC4',     // Blå/turkos för actions  
  [NodeCategory.LOGIC]: '#45B7D1',       // Blå för logic
  [NodeCategory.UTILITIES]: '#96CEB4'    // Grön för utilities
};

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  // TRIGGERS
  [NodeType.MANUAL_TRIGGER]: {
    type: NodeType.MANUAL_TRIGGER,
    category: NodeCategory.TRIGGERS,
    name: 'Manual Trigger',
    description: 'Manually trigger workflow execution',
    icon: 'Play',
    color: NODE_COLORS[NodeCategory.TRIGGERS],
    inputs: [],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'description',
        type: 'string',
        required: false,
        default: '',
        description: 'Description of what triggers this workflow'
      }
    ]
  },

  [NodeType.WEBHOOK]: {
    type: NodeType.WEBHOOK,
    category: NodeCategory.TRIGGERS,
    name: 'Webhook',
    description: 'Trigger workflow via HTTP request',
    icon: 'Webhook',
    color: NODE_COLORS[NodeCategory.TRIGGERS],
    inputs: [],
    outputs: [
      { id: 'output', type: 'output', dataType: 'json' }
    ],
    parameters: [
      {
        name: 'path',
        type: 'string',
        required: true,
        default: '/webhook',
        description: 'Webhook endpoint path'
      },
      {
        name: 'method',
        type: 'select',
        required: true,
        default: 'POST',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ],
        description: 'HTTP method'
      }
    ]
  },

  [NodeType.SCHEDULE]: {
    type: NodeType.SCHEDULE,
    category: NodeCategory.TRIGGERS,
    name: 'Schedule',
    description: 'Trigger workflow on schedule',
    icon: 'Clock',
    color: NODE_COLORS[NodeCategory.TRIGGERS],
    inputs: [],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'cron',
        type: 'string',
        required: true,
        default: '0 0 * * *',
        description: 'Cron expression for scheduling'
      }
    ]
  },

  // ACTIONS
  [NodeType.HTTP_REQUEST]: {
    type: NodeType.HTTP_REQUEST,
    category: NodeCategory.ACTIONS,
    name: 'HTTP Request',
    description: 'Make HTTP requests to external APIs',
    icon: 'Globe',
    color: NODE_COLORS[NodeCategory.ACTIONS],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'json' }
    ],
    parameters: [
      {
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        description: 'Request URL'
      },
      {
        name: 'method',
        type: 'select',
        required: true,
        default: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ],
        description: 'HTTP method'
      }
    ]
  },

  [NodeType.AI_AGENT]: {
    type: NodeType.AI_AGENT,
    category: NodeCategory.ACTIONS,
    name: 'AI Agent',
    description: 'Interact with AI language models using OpenRouter',
    icon: 'Brain',
    color: NODE_COLORS[NodeCategory.ACTIONS],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'model',
        type: 'select',
        required: true,
        default: 'meta-llama/llama-3.3-70b-instruct:free',
        options: [
          { label: 'Meta Llama 3.3 70B (Free)', value: 'meta-llama/llama-3.3-70b-instruct:free' },
          { label: 'DeepSeek V3 (Free)', value: 'deepseek/deepseek-chat-v3-0324:free' },
          { label: 'Google Gemma 3 27B (Free)', value: 'google/gemma-3-27b-it:free' },
          { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
          { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' }
        ],
        description: 'AI model to use'
      },
      {
        name: 'systemMessage',
        type: 'string',
        required: false,
        default: 'You are a helpful AI assistant.',
        description: 'System message/instructions for the AI'
      },
      {
        name: 'userPrompt',
        type: 'string',
        required: true,
        default: '{{input}}',
        description: 'User prompt template (use {{input}} for input data)'
      },
      {
        name: 'temperature',
        type: 'number',
        required: false,
        default: 0.7,
        description: 'Temperature (0.0-2.0) - controls randomness'
      },
      {
        name: 'maxTokens',
        type: 'number',
        required: false,
        default: 1000,
        description: 'Maximum tokens to generate'
      },
      {
        name: 'responseFormat',
        type: 'select',
        required: false,
        default: 'text',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'JSON', value: 'json' },
          { label: 'Auto', value: 'auto' }
        ],
        description: 'Expected response format'
      }
    ]
  },

  [NodeType.EMAIL]: {
    type: NodeType.EMAIL,
    category: NodeCategory.ACTIONS,
    name: 'Email',
    description: 'Send email messages',
    icon: 'Mail',
    color: NODE_COLORS[NodeCategory.ACTIONS],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'json' }
    ],
    parameters: [
      {
        name: 'to',
        type: 'string',
        required: true,
        default: '',
        description: 'Recipient email address'
      },
      {
        name: 'subject',
        type: 'string',
        required: true,
        default: '',
        description: 'Email subject'
      },
      {
        name: 'body',
        type: 'string',
        required: true,
        default: '',
        description: 'Email body'
      }
    ]
  },

  [NodeType.DATABASE]: {
    type: NodeType.DATABASE,
    category: NodeCategory.ACTIONS,
    name: 'Database',
    description: 'Perform database operations',
    icon: 'Database',
    color: NODE_COLORS[NodeCategory.ACTIONS],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'json' }
    ],
    parameters: [
      {
        name: 'operation',
        type: 'select',
        required: true,
        default: 'SELECT',
        options: [
          { label: 'SELECT', value: 'SELECT' },
          { label: 'INSERT', value: 'INSERT' },
          { label: 'UPDATE', value: 'UPDATE' },
          { label: 'DELETE', value: 'DELETE' }
        ],
        description: 'Database operation'
      },
      {
        name: 'query',
        type: 'code',
        required: true,
        default: '',
        description: 'SQL query'
      }
    ]
  },

  // LOGIC
  [NodeType.IF]: {
    type: NodeType.IF,
    category: NodeCategory.LOGIC,
    name: 'IF',
    description: 'Conditional routing of data',
    icon: 'GitBranch',
    color: NODE_COLORS[NodeCategory.LOGIC],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'true', type: 'output', dataType: 'any' },
      { id: 'false', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'condition',
        type: 'string',
        required: true,
        default: '',
        description: 'JavaScript condition expression'
      }
    ]
  },

  [NodeType.FILTER]: {
    type: NodeType.FILTER,
    category: NodeCategory.LOGIC,
    name: 'Filter',
    description: 'Filter data based on conditions',
    icon: 'Filter',
    color: NODE_COLORS[NodeCategory.LOGIC],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'condition',
        type: 'string',
        required: true,
        default: '',
        description: 'Filter condition'
      }
    ]
  },

  [NodeType.SET]: {
    type: NodeType.SET,
    category: NodeCategory.LOGIC,
    name: 'Set',
    description: 'Set and transform data',
    icon: 'Settings',
    color: NODE_COLORS[NodeCategory.LOGIC],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'values',
        type: 'json',
        required: true,
        default: '{}',
        description: 'Key-value pairs to set'
      }
    ]
  },

  [NodeType.MERGE]: {
    type: NodeType.MERGE,
    category: NodeCategory.LOGIC,
    name: 'Merge',
    description: 'Merge multiple data inputs',
    icon: 'Merge',
    color: NODE_COLORS[NodeCategory.LOGIC],
    inputs: [
      { id: 'input1', type: 'input', dataType: 'any' },
      { id: 'input2', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'mode',
        type: 'select',
        required: true,
        default: 'merge',
        options: [
          { label: 'Merge', value: 'merge' },
          { label: 'Append', value: 'append' },
          { label: 'Override', value: 'override' }
        ],
        description: 'Merge strategy'
      }
    ]
  },

  // UTILITIES
  [NodeType.CODE]: {
    type: NodeType.CODE,
    category: NodeCategory.UTILITIES,
    name: 'Code',
    description: 'Execute custom JavaScript code',
    icon: 'Code',
    color: NODE_COLORS[NodeCategory.UTILITIES],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'code',
        type: 'code',
        required: true,
        default: '// Your code here\nreturn input;',
        description: 'JavaScript code to execute'
      }
    ]
  },

  [NodeType.DELAY]: {
    type: NodeType.DELAY,
    category: NodeCategory.UTILITIES,
    name: 'Delay',
    description: 'Pause workflow execution',
    icon: 'Pause',
    color: NODE_COLORS[NodeCategory.UTILITIES],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'duration',
        type: 'number',
        required: true,
        default: 1000,
        description: 'Delay in milliseconds'
      }
    ]
  },

  [NodeType.FUNCTION]: {
    type: NodeType.FUNCTION,
    category: NodeCategory.UTILITIES,
    name: 'Function',
    description: 'Simple data transformation',
    icon: 'Zap',
    color: NODE_COLORS[NodeCategory.UTILITIES],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'function',
        type: 'select',
        required: true,
        default: 'uppercase',
        options: [
          { label: 'Uppercase', value: 'uppercase' },
          { label: 'Lowercase', value: 'lowercase' },
          { label: 'Trim', value: 'trim' },
          { label: 'Length', value: 'length' }
        ],
        description: 'Transformation function'
      }
    ]
  },

  [NodeType.DEBUG]: {
    type: NodeType.DEBUG,
    category: NodeCategory.UTILITIES,
    name: 'Debug',
    description: 'Log and inspect data',
    icon: 'Bug',
    color: NODE_COLORS[NodeCategory.UTILITIES],
    inputs: [
      { id: 'input', type: 'input', dataType: 'any' }
    ],
    outputs: [
      { id: 'output', type: 'output', dataType: 'any' }
    ],
    parameters: [
      {
        name: 'message',
        type: 'string',
        required: false,
        default: 'Debug output',
        description: 'Debug message'
      }
    ]
  }
};