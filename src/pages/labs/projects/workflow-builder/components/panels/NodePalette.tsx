import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import * as Icons from 'lucide-react';
import { NodeType, NodeCategory } from '../../types';
import { NODE_DEFINITIONS, NODE_COLORS } from '../../constants/nodeDefinitions';

interface NodePaletteProps {
  onNodeSelect: (nodeType: NodeType) => void;
  className?: string;
}

const CATEGORY_LABELS = {
  [NodeCategory.TRIGGERS]: 'Triggers',
  [NodeCategory.ACTIONS]: 'Actions',
  [NodeCategory.LOGIC]: 'Logic',
  [NodeCategory.UTILITIES]: 'Utilities'
};

const CATEGORY_DESCRIPTIONS = {
  [NodeCategory.TRIGGERS]: 'Start your workflows',
  [NodeCategory.ACTIONS]: 'Perform operations',
  [NodeCategory.LOGIC]: 'Control flow',
  [NodeCategory.UTILITIES]: 'Helper functions'
};

const NodePalette: React.FC<NodePaletteProps> = ({ onNodeSelect, className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<NodeCategory | null>(null);

  // Gruppera noder per kategori
  const nodesByCategory = Object.values(NODE_DEFINITIONS).reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<NodeCategory, typeof NODE_DEFINITIONS[NodeType][]>);

  return (
    <Card className={`w-80 h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Node Palette</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag nodes to canvas or click to add
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {Object.entries(nodesByCategory).map(([category, nodes]) => {
              const categoryKey = category as NodeCategory;
              const isExpanded = selectedCategory === categoryKey || selectedCategory === null;
              
              return (
                <div key={category} className="space-y-2">
                  {/* Category Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => setSelectedCategory(isExpanded ? null : categoryKey)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: NODE_COLORS[categoryKey] }}
                      />
                      <span className="font-medium text-sm">
                        {CATEGORY_LABELS[categoryKey]}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {nodes.length}
                      </Badge>
                    </div>
                    <Icons.ChevronDown 
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground px-2">
                    {CATEGORY_DESCRIPTIONS[categoryKey]}
                  </p>

                  {/* Nodes in Category */}
                  {isExpanded && (
                    <div className="space-y-1 ml-2">
                      {nodes.map((node) => {
                        const IconComponent = (Icons as any)[node.icon] || Icons.Box;
                        
                        return (
                          <Button
                            key={node.type}
                            variant="ghost"
                            className="w-full justify-start p-3 h-auto hover:bg-muted/50"
                            onClick={() => onNodeSelect(node.type)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div 
                                className="p-1.5 rounded-md flex-shrink-0"
                                style={{ backgroundColor: `${node.color}20` }}
                              >
                                <IconComponent 
                                  className="h-4 w-4" 
                                  style={{ color: node.color }}
                                />
                              </div>
                              
                              <div className="flex-1 text-left min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {node.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {node.description}
                                </div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  
                  {Object.keys(nodesByCategory).indexOf(category) < Object.keys(nodesByCategory).length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NodePalette;