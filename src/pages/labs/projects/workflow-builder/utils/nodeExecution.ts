// Real execution logic for workflow nodes
import { WorkflowNode, Connection } from '../types';
import { toast } from '@/hooks/use-toast';
import { callOpenRouter } from '@/utils/openRouter';

export interface ExecutionResult {
  success: boolean;
  data: any[];
  error?: string;
}

// HTTP Request execution
export const executeHttpRequest = async (config: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
  authType?: string;
  authConfig?: any;
  queryParams?: Record<string, string>;
  responseFormat?: string;
  failOnError?: boolean;
}, inputData: any[]): Promise<ExecutionResult> => {
  try {
    console.log('Making HTTP request to:', config.url, 'with method:', config.method);
    
    if (!config.url) {
      return { success: false, data: [], error: 'URL is required' };
    }

    let url = config.url;
    let headers = { ...config.headers };
    const authType = config.authType || 'none';
    const authConfig = config.authConfig || {};
    const queryParams = config.queryParams || {};
    const responseFormat = config.responseFormat || 'auto';
    const failOnError = config.failOnError ?? true;

    // Add query parameters to URL
    if (Object.keys(queryParams).length > 0) {
      const urlObj = new URL(url);
      Object.entries(queryParams).forEach(([key, value]) => {
        if (key && value) {
          urlObj.searchParams.set(key, String(value));
        }
      });
      url = urlObj.toString();
    }

    // Handle authentication
    switch (authType) {
      case 'bearer':
        if (authConfig.token) {
          headers['Authorization'] = `Bearer ${authConfig.token}`;
        }
        break;
      case 'apikey':
        if (authConfig.apiKey && authConfig.apiKeyName) {
          if (authConfig.apiKeyLocation === 'query') {
            const urlObj = new URL(url);
            urlObj.searchParams.set(authConfig.apiKeyName, authConfig.apiKey);
            url = urlObj.toString();
          } else {
            headers[authConfig.apiKeyName] = authConfig.apiKey;
          }
        }
        break;
      case 'basic':
        if (authConfig.username && authConfig.password) {
          const encoded = btoa(`${authConfig.username}:${authConfig.password}`);
          headers['Authorization'] = `Basic ${encoded}`;
        }
        break;
      case 'custom':
        if (authConfig.customHeaderName && authConfig.customHeaderValue) {
          headers[authConfig.customHeaderName] = authConfig.customHeaderValue;
        }
        break;
    }

    // Set default content type for requests with body
    if (config.method !== 'GET' && config.method !== 'HEAD' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const requestOptions: RequestInit = {
      method: config.method,
      headers,
      signal: controller.signal,
    };

    if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      requestOptions.body = config.body;
    }

    const response = await fetch(url, requestOptions);
    console.log('HTTP Response:', response.status, response.statusText);
    clearTimeout(timeoutId);

    let responseData;
    if (responseFormat === 'text') {
      responseData = await response.text();
    } else if (responseFormat === 'json') {
      responseData = await response.json();
    } else {
      // Auto-detect based on content type
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    }
    console.log('Response data:', responseData);

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      url: response.url,
      timestamp: new Date().toISOString(),
    };

    if (!response.ok && failOnError) {
      return {
        success: false,
        data: [result],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    console.log('HTTP execution result:', { success: true, data: [result] });
    return { success: true, data: [result] };
  } catch (error: any) {
    console.error('HTTP request failed:', error);
    if (error.name === 'AbortError') {
      return { success: false, data: [], error: 'Request timeout' };
    }
    return {
      success: false,
      data: [],
      error: error.message || 'Network error',
    };
  }
};

// Condition evaluation
export const evaluateCondition = (item: any, condition: {
  field: string;
  operator: string;
  value: string;
  dataType: string;
}): boolean => {
  const { field, operator, value, dataType } = condition;
  
  // Get field value from item
  const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], item);
  
  // Convert values based on data type
  let compareValue: any = value;
  let itemValue: any = fieldValue;
  
  switch (dataType) {
    case 'number':
      compareValue = parseFloat(value);
      itemValue = parseFloat(fieldValue);
      break;
    case 'boolean':
      compareValue = value.toLowerCase() === 'true';
      itemValue = Boolean(fieldValue);
      break;
    case 'datetime':
      compareValue = new Date(value);
      itemValue = new Date(fieldValue);
      break;
    default:
      compareValue = String(value);
      itemValue = String(fieldValue || '');
  }
  
  // Evaluate based on operator
  switch (operator) {
    case 'equals':
      return itemValue === compareValue;
    case 'not_equals':
      return itemValue !== compareValue;
    case 'contains':
      return String(itemValue).includes(String(compareValue));
    case 'not_contains':
      return !String(itemValue).includes(String(compareValue));
    case 'starts_with':
      return String(itemValue).startsWith(String(compareValue));
    case 'ends_with':
      return String(itemValue).endsWith(String(compareValue));
    case 'is_empty':
      return !itemValue || itemValue === '';
    case 'is_not_empty':
      return itemValue && itemValue !== '';
    case 'greater_than':
      return itemValue > compareValue;
    case 'greater_equal':
      return itemValue >= compareValue;
    case 'less_than':
      return itemValue < compareValue;
    case 'less_equal':
      return itemValue <= compareValue;
    case 'is_after':
      return itemValue > compareValue;
    case 'is_before':
      return itemValue < compareValue;
    default:
      return false;
  }
};

// If node execution
export const executeIfNode = (config: {
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
    dataType: string;
  }>;
  combineConditions: 'AND' | 'OR';
}, inputData: any[]): { trueItems: any[], falseItems: any[] } => {
  const trueItems: any[] = [];
  const falseItems: any[] = [];
  
  for (const item of inputData) {
    let result = config.combineConditions === 'AND';
    
    for (const condition of config.conditions) {
      const conditionResult = evaluateCondition(item, condition);
      
      if (config.combineConditions === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }
    }
    
    if (result) {
      trueItems.push({
        ...item,
        conditionResult: true,
        evaluatedAt: new Date().toISOString(),
      });
    } else {
      falseItems.push({
        ...item,
        conditionResult: false,
        evaluatedAt: new Date().toISOString(),
      });
    }
  }
  
  return { trueItems, falseItems };
};

// Filter node execution
export const executeFilterNode = (config: {
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
    dataType: string;
  }>;
  combineConditions: 'AND' | 'OR';
}, inputData: any[]): ExecutionResult => {
  try {
    const filteredItems: any[] = [];
    
    for (const item of inputData) {
      let keepItem = config.combineConditions === 'AND';
      
      for (const condition of config.conditions) {
        const conditionResult = evaluateCondition(item, condition);
        
        if (config.combineConditions === 'AND') {
          keepItem = keepItem && conditionResult;
        } else {
          keepItem = keepItem || conditionResult;
        }
      }
      
      if (keepItem) {
        filteredItems.push({
          ...item,
          filteredAt: new Date().toISOString(),
        });
      }
    }
    
    return { success: true, data: filteredItems };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

// Set node execution
export const executeSetNode = (config: {
  operation: string;
  fieldMappings: Array<{
    outputField: string;
    inputValue: string;
    type: 'value' | 'expression';
  }>;
  keepOnlySet: boolean;
}, inputData: any[]): ExecutionResult => {
  try {
    const transformedItems = inputData.map(item => {
      let result = config.keepOnlySet ? {} : { ...item };
      
      // Apply field mappings
      for (const mapping of config.fieldMappings) {
        const { outputField, inputValue, type } = mapping;
        
        if (type === 'expression') {
          // Simple expression evaluation (can be enhanced)
          try {
            // Replace $input.item.field with actual values
            let expression = inputValue;
            const fieldMatches = expression.match(/\$input\.item\.(\w+)/g);
            
            if (fieldMatches) {
              for (const match of fieldMatches) {
                const fieldName = match.replace('$input.item.', '');
                const fieldValue = item[fieldName];
                expression = expression.replace(match, JSON.stringify(fieldValue));
              }
            }
            
            // Evaluate the expression (limited for security)
            const evalResult = new Function(`return ${expression}`)();
            result[outputField] = evalResult;
          } catch (error) {
            result[outputField] = inputValue; // Fallback to literal value
          }
        } else {
          // Static value
          result[outputField] = inputValue;
        }
      }
      
      // Handle operation types
      if (config.operation === 'remove_fields') {
        for (const mapping of config.fieldMappings) {
          delete result[mapping.outputField];
        }
      }
      
      result.transformedAt = new Date().toISOString();
      return result;
    });
    
    return { success: true, data: transformedItems };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
};

// Get input data for a node
export const getNodeInputData = (nodeId: string, nodes: any[], edges: any[], executionResults?: Map<string, any>): any[] => {
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  if (incomingEdges.length === 0) {
    // Check if this is a trigger node
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'manualTrigger') {
      return [
        { id: 1, name: 'Sample Item 1', value: 100, category: 'A', timestamp: new Date().toISOString() },
        { id: 2, name: 'Sample Item 2', value: 200, category: 'B', timestamp: new Date().toISOString() },
        { id: 3, name: 'Sample Item 3', value: 150, category: 'A', timestamp: new Date().toISOString() },
      ];
    }
    return [];
  }
  
  // Combine data from all source nodes
  let combinedInput: any[] = [];
  for (const edge of incomingEdges) {
    // First try to get from execution results (live data flow)
    if (executionResults && executionResults.has(edge.source)) {
      const sourceOutput = executionResults.get(edge.source);
      if (Array.isArray(sourceOutput)) {
        combinedInput = [...combinedInput, ...sourceOutput];
      }
    } else {
      // Fallback to node data
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode?.data?.outputData) {
        combinedInput = [...combinedInput, ...sourceNode.data.outputData];
      }
    }
  }
  
  return combinedInput;
};

// AI Agent execution
export const executeAIAgent = async (config: {
  model: string;
  systemMessage: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: string;
  apiKey: string;
}, inputData: any[]): Promise<ExecutionResult> => {
  try {
    console.log('Executing AI Agent with model:', config.model);
    
    if (!config.apiKey) {
      return { success: false, data: [], error: 'OpenRouter API key is required' };
    }

    if (!config.model) {
      return { success: false, data: [], error: 'AI model is required' };
    }

    if (!config.userPrompt) {
      return { success: false, data: [], error: 'User prompt is required' };
    }

    const results = [];

    // Process each input item (or single request if no input data)
    const itemsToProcess = inputData.length > 0 ? inputData : [{}];

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      
      try {
        // Replace template variables in the user prompt
        let processedPrompt = config.userPrompt;
        
        // Replace {{input}} with the entire input data
        if (processedPrompt.includes('{{input}}')) {
          const inputText = inputData.length > 0 ? JSON.stringify(item) : '';
          processedPrompt = processedPrompt.replace(/\{\{input\}\}/g, inputText);
        }

        // Replace {{input.field}} with specific fields
        const fieldMatches = processedPrompt.match(/\{\{input\.(\w+)\}\}/g);
        if (fieldMatches) {
          for (const match of fieldMatches) {
            const fieldName = match.replace(/\{\{input\.|\}\}/g, '');
            const fieldValue = item[fieldName] || '';
            processedPrompt = processedPrompt.replace(match, String(fieldValue));
          }
        }

        // Replace {{json input}} with JSON formatted input
        if (processedPrompt.includes('{{json input}}')) {
          const jsonInput = JSON.stringify(item, null, 2);
          processedPrompt = processedPrompt.replace(/\{\{json input\}\}/g, jsonInput);
        }

        console.log('Processed prompt for item', i + 1, ':', processedPrompt);

        // Call OpenRouter API
        const response = await callOpenRouter(
          processedPrompt,
          config.model,
          config.systemMessage || 'analytical',
          config.apiKey,
          'medium' // Default response length
        );

        console.log('AI response for item', i + 1, ':', response);

        // Process response based on format
        let processedResponse = response;
        if (config.responseFormat === 'json') {
          try {
            processedResponse = JSON.parse(response);
          } catch (e) {
            console.warn('Failed to parse JSON response, returning as text');
          }
        }

        // Create result object
        const result = {
          input: item,
          prompt: processedPrompt,
          response: processedResponse,
          model: config.model,
          timestamp: new Date().toISOString(),
          tokens: response.length, // Approximate token count
          index: i
        };

        results.push(result);

      } catch (itemError: any) {
        console.error(`Failed to process item ${i + 1}:`, itemError);
        
        // Add error result for this item
        results.push({
          input: item,
          error: itemError.message || 'Unknown error',
          model: config.model,
          timestamp: new Date().toISOString(),
          index: i
        });
      }
    }

    console.log('AI Agent execution completed. Results:', results);
    return { success: true, data: results };

  } catch (error: any) {
    console.error('AI Agent execution failed:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'AI execution failed',
    };
  }
};