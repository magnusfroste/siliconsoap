import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch, Settings, Plus, X, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import NodeDataViewer from './NodeDataViewer';

interface Condition {
  field: string;
  operator: string;
  value: string;
  dataType: string;
}

interface IfNodeData {
  id: string;
  label: string;
  conditions: Condition[];
  combineConditions: 'AND' | 'OR';
  inputData?: any[];
  outputData?: any[];
  isExecuted: boolean;
  executionError?: string;
}

const dataTypes = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'datetime', label: 'Date & Time' },
];

const operators = {
  string: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  number: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'greater_than', label: 'greater than' },
    { value: 'greater_equal', label: 'greater than or equal' },
    { value: 'less_than', label: 'less than' },
    { value: 'less_equal', label: 'less than or equal' },
  ],
  boolean: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
  ],
  datetime: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'is_after', label: 'is after' },
    { value: 'is_before', label: 'is before' },
  ],
};

const IfNode = memo<NodeProps>(({ id, data, selected }) => {
  const nodeData = data as any;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    conditions: nodeData.conditions || [{ field: '', operator: 'equals', value: '', dataType: 'string' }],
    combineConditions: nodeData.combineConditions || 'AND' as 'AND' | 'OR',
  });

  const handleSaveConfig = () => {
    Object.assign(nodeData, tempConfig);
    setIsConfigOpen(false);
  };

  const handleCancel = () => {
    setTempConfig({
      conditions: nodeData.conditions || [{ field: '', operator: 'equals', value: '', dataType: 'string' }],
      combineConditions: nodeData.combineConditions || 'AND',
    });
    setIsConfigOpen(false);
  };

  const addCondition = () => {
    setTempConfig(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: 'equals', value: '', dataType: 'string' }]
    }));
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    setTempConfig(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const removeCondition = (index: number) => {
    if (tempConfig.conditions.length > 1) {
      setTempConfig(prev => ({
        ...prev,
        conditions: prev.conditions.filter((_, i) => i !== index)
      }));
    }
  };

  const getStatusColor = () => {
    if (nodeData.executionError) return 'bg-destructive';
    if (nodeData.isExecuted) return 'bg-green-500';
    return 'bg-muted';
  };

  const conditionsCount = nodeData.conditions?.length || 0;

  return (
    <>
      <div 
        className={`relative bg-background border-2 rounded-lg shadow-sm transition-all ${
          selected ? 'border-primary' : 'border-border'
        } ${isHovered ? 'shadow-md' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle type="target" position={Position.Left} className="w-3 h-3" />
        
        <div className="p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">If</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              className="h-6 w-6 p-0"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {conditionsCount > 0 ? (
                <span>{conditionsCount} condition{conditionsCount > 1 ? 's' : ''}</span>
              ) : (
                <span>No conditions configured</span>
              )}
            </div>
            
            {nodeData.isExecuted && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="text-xs text-muted-foreground">
                  {nodeData.executionError ? 'Failed' : 'Evaluated'}
                </span>
              </div>
            )}
          </div>
        </div>

        {isHovered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDataViewOpen(true)}
            className="absolute top-2 right-8 h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        )}
        
        {/* True output */}
        <Handle 
          type="source" 
          position={Position.Right} 
          id="true"
          style={{ top: 30 }}
          className="w-3 h-3 bg-green-500"
        />
        
        {/* False output */}
        <Handle 
          type="source" 
          position={Position.Right} 
          id="false"
          style={{ top: 70 }}
          className="w-3 h-3 bg-red-500"
        />
        
        {/* Output labels */}
        <div className="absolute right-4 top-6 text-xs text-green-600 font-medium">true</div>
        <div className="absolute right-4 top-16 text-xs text-red-600 font-medium">false</div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure If Conditions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Conditions</h3>
              <div className="flex items-center gap-2">
                {tempConfig.conditions.length > 1 && (
                  <Select 
                    value={tempConfig.combineConditions} 
                    onValueChange={(value: 'AND' | 'OR') => setTempConfig(prev => ({ ...prev, combineConditions: value }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={addCondition} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {tempConfig.conditions.map((condition, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <Label className="col-span-2 text-sm">Field</Label>
                    <Input
                      className="col-span-3"
                      value={condition.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                      placeholder="data.field"
                    />
                    
                    <Select 
                      value={condition.dataType} 
                      onValueChange={(value) => updateCondition(index, 'dataType', value)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={condition.operator} 
                      onValueChange={(value) => updateCondition(index, 'operator', value)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators[condition.dataType as keyof typeof operators]?.map(op => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                      <Input
                        className="col-span-2"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="Value"
                      />
                    )}
                    
                    {tempConfig.conditions.length > 1 && (
                      <Button
                        onClick={() => removeCondition(index)}
                        size="sm"
                        variant="ghost"
                        className="col-span-1 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {index < tempConfig.conditions.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {tempConfig.combineConditions}
                      </Badge>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleCancel} variant="outline">Cancel</Button>
            <Button onClick={handleSaveConfig}>Save Configuration</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Viewer */}
      <NodeDataViewer
        isOpen={isDataViewOpen}
        onClose={() => setIsDataViewOpen(false)}
        nodeData={{
          id: nodeData.id,
          type: 'if',
          label: nodeData.label,
          inputData: nodeData.inputData,
          outputData: nodeData.outputData,
          isExecuted: nodeData.isExecuted,
          executionError: nodeData.executionError,
        }}
      />
    </>
  );
});

IfNode.displayName = 'IfNode';

export default IfNode;