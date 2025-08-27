// Core Node Definition Interface
export interface NodeDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: NodeCategory;
  author: {
    name: string;
    email?: string;
    github?: string;
  };
  
  // Visual representation
  icon: string;
  color: string;
  
  // Input/Output schema
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  
  // Configuration schema
  properties: PropertyDefinition[];
  
  // Execution function
  execute: NodeExecutor;
  
  // Optional lifecycle hooks
  lifecycle?: {
    onInit?: (context: NodeContext) => Promise<void>;
    onDestroy?: (context: NodeContext) => Promise<void>;
    validate?: (data: any) => ValidationResult;
  };
  
  // Dependencies and requirements
  dependencies?: string[];
  requirements?: {
    credentials?: string[];
    environment?: Record<string, string>;
    runtime?: 'browser' | 'node' | 'both';
  };
}

export interface PortDefinition {
  id: string;
  name: string;
  type: DataType;
  required: boolean;
  description: string;
  schema?: JSONSchema;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json' | 'code';
  required: boolean;
  default?: any;
  description: string;
  options?: Array<{ label: string; value: any }>;
  validation?: ValidationRule[];
}

export type NodeCategory = 
  | 'trigger' 
  | 'action' 
  | 'transform' 
  | 'condition' 
  | 'integration' 
  | 'utility' 
  | 'ai' 
  | 'database' 
  | 'http' 
  | 'file' 
  | 'notification';

export type DataType = 
  | 'any' 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'object' 
  | 'array' 
  | 'file' 
  | 'credential';

export interface NodeExecutor {
  (context: ExecutionContext): Promise<ExecutionResult>;
}

export interface ExecutionContext {
  nodeId: string;
  inputs: Record<string, any>;
  properties: Record<string, any>;
  credentials: Record<string, any>;
  environment: Record<string, string>;
  logger: Logger;
  storage: Storage;
  http: HttpClient;
}

export interface ExecutionResult {
  outputs: Record<string, any>;
  logs?: LogEntry[];
  metrics?: Record<string, number>;
  error?: Error;
}

export interface NodeContext {
  nodeId: string;
  workflowId: string;
  properties: Record<string, any>;
  logger: Logger;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

export interface Logger {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error): void;
  debug(message: string, data?: any): void;
}

export interface Storage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface HttpClient {
  get(url: string, options?: RequestOptions): Promise<Response>;
  post(url: string, data?: any, options?: RequestOptions): Promise<Response>;
  put(url: string, data?: any, options?: RequestOptions): Promise<Response>;
  delete(url: string, options?: RequestOptions): Promise<Response>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token: string;
  };
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  data?: any;
}