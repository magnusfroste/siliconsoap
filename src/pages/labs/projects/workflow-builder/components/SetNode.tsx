import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Settings2, Settings, Plus, X, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NodeDataViewer from './NodeDataViewer';

interface FieldMapping {
  outputField: string;
  inputValue: string;
  type: 'value' | 'expression';
}

interface SetNodeData {
  id: string;
  label: string;
  operation: 'keep_fields' | 'remove_fields' | 'add_fields' | 'transform';
  fieldMappings: FieldMapping[];
  keepOnlySet: boolean;
  inputData?: any[];
  outputData?: any[];
  isExecuted: boolean;
  executionError?: string;
}

const operationTypes = [
  { value: 'add_fields', label: 'Add Fields' },
  { value: 'transform', label: 'Transform Data' },
  { value: 'keep_fields', label: 'Keep Only Fields' },
  { value: 'remove_fields', label: 'Remove Fields' },
];

const SetNode = memo<NodeProps>(({ id, data, selected }) => {
  const nodeData = data as any;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    operation: nodeData.operation || 'add_fields',
    fieldMappings: nodeData.fieldMappings || [{ outputField: '', inputValue: '', type: 'value' as 'value' | 'expression' }],
    keepOnlySet: nodeData.keepOnlySet || false,
  });

  const handleSaveConfig = () => {
    Object.assign(nodeData, tempConfig);
    setIsConfigOpen(false);
  };

  const handleCancel = () => {
    setTempConfig({
      operation: nodeData.operation || 'add_fields',
      fieldMappings: nodeData.fieldMappings || [{ outputField: '', inputValue: '', type: 'value' }],
      keepOnlySet: nodeData.keepOnlySet || false,
    });
    setIsConfigOpen(false);
  };

  const addFieldMapping = () => {
    setTempConfig(prev => ({
      ...prev,
      fieldMappings: [...prev.fieldMappings, { outputField: '', inputValue: '', type: 'value' }]
    }));
  };

  const updateFieldMapping = (index: number, field: keyof FieldMapping, value: string) => {
    setTempConfig(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map((mapping, i) => 
        i === index ? { ...mapping, [field]: value } : mapping
      )
    }));
  };

  const removeFieldMapping = (index: number) => {
    if (tempConfig.fieldMappings.length > 1) {
      setTempConfig(prev => ({
        ...prev,
        fieldMappings: prev.fieldMappings.filter((_, i) => i !== index)
      }));
    }
  };

  const getStatusColor = () => {
    if (nodeData.executionError) return 'bg-destructive';
    if (nodeData.isExecuted) return 'bg-green-500';
    return 'bg-muted';
  };

  const getOperationDescription = (operation: string) => {
    switch (operation) {
      case 'add_fields': return 'Add new fields';
      case 'transform': return 'Transform data';
      case 'keep_fields': return 'Keep only specified fields';
      case 'remove_fields': return 'Remove specified fields';
      default: return 'Set data';
    }
  };

  const fieldsCount = nodeData.fieldMappings?.length || 0;

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
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Set</span>
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
              {getOperationDescription(nodeData.operation || 'add_fields')}
            </div>
            
            {fieldsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {fieldsCount} field{fieldsCount > 1 ? 's' : ''}
              </Badge>
            )}
            
            {nodeData.isExecuted && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="text-xs text-muted-foreground">
                  {nodeData.executionError ? 'Failed' : 'Transformed'}
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
        
        <Handle type="source" position={Position.Right} className="w-3 h-3" />
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Set Node</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <Label className="text-right">Operation</Label>
              <Select 
                value={tempConfig.operation} 
                onValueChange={(value) => setTempConfig(prev => ({ ...prev, operation: value as any }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Field Mappings</h3>
              <Button onClick={addFieldMapping} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>
            
            <div className="space-y-3">
              {tempConfig.fieldMappings.map((mapping, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <Label className="col-span-2 text-sm pt-2">Field Name</Label>
                    <Input
                      className="col-span-3"
                      value={mapping.outputField}
                      onChange={(e) => updateFieldMapping(index, 'outputField', e.target.value)}
                      placeholder="field_name"
                    />
                    
                    <Select 
                      value={mapping.type} 
                      onValueChange={(value: 'value' | 'expression') => updateFieldMapping(index, 'type', value)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="value">Fixed Value</SelectItem>
                        <SelectItem value="expression">Expression</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="col-span-4">
                      {mapping.type === 'expression' ? (
                        <Textarea
                          value={mapping.inputValue}
                          onChange={(e) => updateFieldMapping(index, 'inputValue', e.target.value)}
                          placeholder="$input.item.existing_field"
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={mapping.inputValue}
                          onChange={(e) => updateFieldMapping(index, 'inputValue', e.target.value)}
                          placeholder="Static value"
                        />
                      )}
                    </div>
                    
                    {tempConfig.fieldMappings.length > 1 && (
                      <Button
                        onClick={() => removeFieldMapping(index)}
                        size="sm"
                        variant="ghost"
                        className="col-span-1 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {mapping.type === 'expression' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Use <code>$input.item.field</code> to reference input data fields
                    </div>
                  )}
                </Card>
              ))}
            </div>
            
            {(tempConfig.operation === 'add_fields' || tempConfig.operation === 'transform') && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="keepOnlySet"
                  checked={tempConfig.keepOnlySet}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, keepOnlySet: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="keepOnlySet" className="text-sm">
                  Keep only the fields that are set (remove all other fields)
                </Label>
              </div>
            )}
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
          type: 'set',
          label: nodeData.label,
          inputData: nodeData.inputData || [],
          outputData: nodeData.outputData || [],
          isExecuted: nodeData.isExecuted,
          executionError: nodeData.executionError,
        }}
      />
    </>
  );
});

SetNode.displayName = 'SetNode';

export default SetNode;