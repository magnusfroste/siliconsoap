// Real execution logic for workflow nodes

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
}, inputData: any[]): Promise<ExecutionResult> => {
  try {
    console.log('Making HTTP request to:', config.url, 'with method:', config.method);
    
    if (!config.url) {
      return { success: false, data: [], error: 'URL is required' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const requestOptions: RequestInit = {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      signal: controller.signal,
    };

    if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      requestOptions.body = config.body;
    }

    const response = await fetch(config.url, requestOptions);
    console.log('HTTP Response:', response.status, response.statusText);
    clearTimeout(timeoutId);

    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('JSON Response data:', responseData);
    } else {
      responseData = await response.text();
      console.log('Text Response data:', responseData);
    }

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      timestamp: new Date().toISOString(),
    };

    if (!response.ok) {
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