import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Database, FileText, Settings, Save, X } from 'lucide-react';

interface NodeDataViewerProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    id: string;
    type: string;
    label: string;
    code?: string;
    inputData?: any[];
    outputData?: any[];
    isExecuted?: boolean;
  };
  onSaveCode?: (code: string) => void;
}

const NodeDataViewer: React.FC<NodeDataViewerProps> = ({ 
  isOpen, 
  onClose, 
  nodeData, 
  onSaveCode 
}) => {
  const [code, setCode] = useState(nodeData.code || '');
  const [activeTab, setActiveTab] = useState('json');

  const handleSaveCode = () => {
    onSaveCode?.(code);
    onClose();
  };

  const renderDataView = (data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No data available
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

    if (activeTab === 'table' && data.length > 0) {
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

    return null;
  };

  const getNodeIcon = () => {
    switch (nodeData.type) {
      case 'code': return <Code className="h-4 w-4" />;
      case 'ai': return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getNodeIcon()}
            {nodeData.label || 'Node Data'}
            <Badge variant={nodeData.isExecuted ? 'default' : 'secondary'}>
              {nodeData.isExecuted ? 'Executed' : 'Not executed'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {/* Input Panel */}
          <div className="border rounded-lg flex flex-col">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-sm">INPUT</span>
                <Badge variant="outline" className="ml-auto">
                  {nodeData.inputData?.length || 0} items
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
                  {renderDataView(nodeData.inputData)}
                </TabsContent>
                <TabsContent value="table" className="mt-0">
                  {renderDataView(nodeData.inputData)}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Code/Parameters Panel (Middle) */}
          <div className="border rounded-lg flex flex-col">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {nodeData.type === 'code' ? 'CODE' : 'PARAMETERS'}
                </span>
              </div>
            </div>
            <div className="flex-1 p-4">
              {nodeData.type === 'code' ? (
                <div className="space-y-4 h-full flex flex-col">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 font-mono text-sm resize-none"
                    placeholder="Enter your JavaScript code here..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveCode} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Code
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Node parameters and settings
                </div>
              )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="border rounded-lg flex flex-col">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-sm">OUTPUT</span>
                <Badge variant="outline" className="ml-auto">
                  {nodeData.outputData?.length || 0} items
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
                  {renderDataView(nodeData.outputData)}
                </TabsContent>
                <TabsContent value="table" className="mt-0">
                  {renderDataView(nodeData.outputData)}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeDataViewer;