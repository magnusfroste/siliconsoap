// Safe JavaScript execution utility for workflow nodes
export interface ExecutionInput {
  all: () => any[];
}

export interface ExecutionContext {
  $input: ExecutionInput;
}

export const executeJavaScript = (code: string, inputData: any[] = []): { output: any[], error?: string, consoleOutput?: string[] } => {
  try {
    // Capture console output
    const consoleOutput: string[] = [];
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };

    // Override console methods to capture output
    const mockConsole = {
      log: (...args: any[]) => {
        consoleOutput.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
        originalConsole.log(...args);
      },
      error: (...args: any[]) => {
        consoleOutput.push('ERROR: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
        originalConsole.error(...args);
      },
      warn: (...args: any[]) => {
        consoleOutput.push('WARN: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
        originalConsole.warn(...args);
      }
    };

    // Create the execution context similar to n8n
    const $input: ExecutionInput = {
      all: () => inputData
    };

    // Create a safe execution environment with console override
    const func = new Function('$input', 'console', code);
    
    // Execute the code with mocked console
    const result = func($input, mockConsole);
    
    // Handle different return types
    if (Array.isArray(result)) {
      return { output: result, consoleOutput };
    } else if (result !== undefined && result !== null) {
      return { output: [result], consoleOutput };
    } else {
      // If no return, check if input was modified or use default output
      const hasConsoleOutput = consoleOutput.length > 0;
      if (hasConsoleOutput || inputData.length > 0) {
        return { output: inputData, consoleOutput };
      }
      // Generate sample output if nothing else
      return { 
        output: [{ message: 'Code executed successfully', timestamp: new Date().toISOString() }], 
        consoleOutput 
      };
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