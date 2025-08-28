import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Clock, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  status: 'success' | 'error' | 'running';
  duration?: number;
  timestamp: Date;
  error?: string;
}

interface ExecutionBottomPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  executionSteps: ExecutionStep[];
  selectedNodeId?: string;
  nodeData: {
    [nodeId: string]: {
      inputData?: any[];
      outputData?: any[];
    };
  };
}

const ExecutionBottomPanel: React.FC<ExecutionBottomPanelProps> = ({
  isOpen,
  onToggle,
  executionSteps,
  selectedNodeId,
  nodeData,
}) => {
  const [activeTab, setActiveTab] = useState('json');

  const selectedNodeData = selectedNodeId ? nodeData[selectedNodeId] : null;

  const renderDataView = (data: any[], title: string) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No {title.toLowerCase()} data
        </div>
      );
    }

    if (activeTab === 'json') {
      return (
        <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-auto max-h-96 font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }

    if (activeTab === 'table' && data.length > 0 && typeof data[0] === 'object') {
      const keys = Object.keys(data[0]);
      return (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {keys.map((key) => (
                  <th key={key} className="px-3 py-2 text-left font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-t">
                  {keys.map((key) => (
                    <td key={key} className="px-3 py-2">
                      {typeof item[key] === 'object' 
                        ? JSON.stringify(item[key]) 
                        : String(item[key])
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="text-center text-muted-foreground py-8">
        Table view not available for this data type
      </div>
    );
  };

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full py-2 rounded-none"
        >
          <ChevronUp className="h-4 w-4 mr-2" />
          Show Execution Results
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10 h-80">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h3 className="text-sm font-medium">Execution Results</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 h-full">
        {/* Execution Log */}
        <div className="border-r border-border flex flex-col">
          <div className="bg-muted/50 px-4 py-2 border-b border-border">
            <span className="text-sm font-medium">Execution Log</span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {executionSteps.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No executions yet
              </div>
            ) : (
              executionSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${
                    step.nodeId === selectedNodeId ? 'bg-accent border-accent-foreground/20' : 'border-border'
                  }`}
                >
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{step.nodeLabel}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.status === 'success' && step.duration 
                        ? `Success in ${step.duration}ms`
                        : step.status === 'error' && step.error
                        ? step.error
                        : step.timestamp.toLocaleTimeString()
                      }
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Panel */}
        <div className="border-r border-border flex flex-col">
          <div className="bg-muted/50 px-4 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">INPUT</span>
              <Badge variant="outline" className="ml-auto">
                {selectedNodeData?.inputData?.length || 0} items
              </Badge>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <TabsContent value="json" className="mt-0">
                {renderDataView(selectedNodeData?.inputData || [], 'Input')}
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                {renderDataView(selectedNodeData?.inputData || [], 'Input')}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col">
          <div className="bg-muted/50 px-4 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">OUTPUT</span>
              <Badge variant="outline" className="ml-auto">
                {selectedNodeData?.outputData?.length || 0} items
              </Badge>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <TabsContent value="json" className="mt-0">
                {renderDataView(selectedNodeData?.outputData || [], 'Output')}
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                {renderDataView(selectedNodeData?.outputData || [], 'Output')}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionBottomPanel;