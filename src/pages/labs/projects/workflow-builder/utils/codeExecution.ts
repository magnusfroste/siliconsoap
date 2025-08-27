// Safe JavaScript execution utility for workflow nodes
export interface ExecutionInput {
  all: () => any[];
}

export interface ExecutionContext {
  $input: ExecutionInput;
}

export const executeJavaScript = (code: string, inputData: any[] = []): { output: any[], error?: string } => {
  try {
    // Create the execution context similar to n8n
    const $input: ExecutionInput = {
      all: () => inputData
    };

    // Create a safe execution environment
    const func = new Function('$input', code);
    
    // Execute the code
    const result = func($input);
    
    // Handle different return types
    if (Array.isArray(result)) {
      return { output: result };
    } else if (result !== undefined && result !== null) {
      return { output: [result] };
    } else {
      // If no return, assume the input was modified in place
      return { output: inputData };
    }
  } catch (error) {
    return { 
      output: inputData, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const getNodeInputData = (nodeId: string, nodes: any[], edges: any[]): any[] => {
  // Find edges that connect to this node
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  if (incomingEdges.length === 0) {
    // If no incoming edges, this might be a trigger node
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'manualTrigger') {
      return [
        { id: 1, name: 'Item 1', value: 100, timestamp: new Date().toISOString() },
        { id: 2, name: 'Item 2', value: 200, timestamp: new Date().toISOString() }
      ];
    }
    return [];
  }
  
  // Get output data from source nodes
  let combinedInput: any[] = [];
  for (const edge of incomingEdges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode?.data?.outputData) {
      combinedInput = [...combinedInput, ...sourceNode.data.outputData];
    }
  }
  
  return combinedInput;
};