// Core types för workflow builder - Inspirerat av n8n

export enum NodeType {
  // Triggers
  MANUAL_TRIGGER = 'manual-trigger',
  WEBHOOK = 'webhook',
  SCHEDULE = 'schedule',
  
  // Actions
  HTTP_REQUEST = 'http-request',
  EMAIL = 'email',
  DATABASE = 'database',
  AI_CHAT = 'ai-chat',
  
  // Logic
  IF = 'if',
  FILTER = 'filter',
  SET = 'set',
  MERGE = 'merge',
  
  // Utilities
  CODE = 'code',
  DELAY = 'delay',
  FUNCTION = 'function',
  DEBUG = 'debug'
}

export enum NodeCategory {
  TRIGGERS = 'triggers',
  ACTIONS = 'actions', 
  LOGIC = 'logic',
  UTILITIES = 'utilities'
}

export enum ExecutionStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export interface ConnectionPoint {
  id: string;
  type: 'input' | 'output';
  dataType?: string;
  required?: boolean;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  category: NodeCategory;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: ConnectionPoint[];
  outputs: ConnectionPoint[];
  status: ExecutionStatus;
  executionTime?: number;
  error?: string;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  settings: WorkflowSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowSettings {
  autoSave: boolean;
  saveInterval: number;
  timezone: string;
  executionTimeout: number;
}

export interface NodeDefinition {
  type: NodeType;
  category: NodeCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  inputs: ConnectionPoint[];
  outputs: ConnectionPoint[];
  parameters: NodeParameter[];
}

export interface NodeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json' | 'code';
  required: boolean;
  default?: any;
  options?: { label: string; value: any }[];
  description?: string;
}

export interface ExecutionContext {
  workflowId: string;
  nodeId: string;
  runId: string;
  inputData: Record<string, any>;
  parameters: Record<string, any>;
}