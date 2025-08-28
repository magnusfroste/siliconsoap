import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronDown, 
  Plus, 
  Copy, 
  Download, 
  Edit3, 
  Trash2, 
  Settings,
  Upload,
  FileText
} from 'lucide-react';

export interface Workflow {
  id: string;
  name: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowTabsProps {
  workflows: Workflow[];
  activeWorkflowId: string;
  onWorkflowSelect: (workflowId: string) => void;
  onWorkflowCreate: (name: string) => void;
  onWorkflowDelete: (workflowId: string) => void;
  onWorkflowRename: (workflowId: string, newName: string) => void;
  onWorkflowDuplicate: (workflowId: string) => void;
  onWorkflowImport: (data: any) => void;
  onWorkflowExport: (workflowId: string) => void;
}

const WorkflowTabs: React.FC<WorkflowTabsProps> = ({
  workflows,
  activeWorkflowId,
  onWorkflowSelect,
  onWorkflowCreate,
  onWorkflowDelete,
  onWorkflowRename,
  onWorkflowDuplicate,
  onWorkflowImport,
  onWorkflowExport,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [renameWorkflowId, setRenameWorkflowId] = useState('');
  const [deleteWorkflowId, setDeleteWorkflowId] = useState('');

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId);

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      onWorkflowCreate(newWorkflowName.trim());
      setNewWorkflowName('');
      setShowCreateDialog(false);
    }
  };

  const handleRenameWorkflow = () => {
    if (newWorkflowName.trim() && renameWorkflowId) {
      onWorkflowRename(renameWorkflowId, newWorkflowName.trim());
      setNewWorkflowName('');
      setRenameWorkflowId('');
      setShowRenameDialog(false);
    }
  };

  const handleDeleteWorkflow = () => {
    if (deleteWorkflowId) {
      onWorkflowDelete(deleteWorkflowId);
      setDeleteWorkflowId('');
      setShowDeleteDialog(false);
    }
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            onWorkflowImport(jsonData);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const openRenameDialog = (workflowId: string, currentName: string) => {
    setRenameWorkflowId(workflowId);
    setNewWorkflowName(currentName);
    setShowRenameDialog(true);
  };

  const openDeleteDialog = (workflowId: string) => {
    setDeleteWorkflowId(workflowId);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b">
        {/* Workflow Selector */}
        <div className="flex items-center gap-1">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="flex items-center">
              <Button
                variant={workflow.id === activeWorkflowId ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onWorkflowSelect(workflow.id)}
                className="rounded-r-none border-r-0"
              >
                <FileText className="h-4 w-4 mr-1" />
                {workflow.name}
              </Button>
              {workflow.id === activeWorkflowId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-l-none px-2"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => onWorkflowDuplicate(workflow.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onWorkflowExport(workflow.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openRenameDialog(workflow.id, workflow.name)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleImportJSON}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import from File...
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(workflow.id)}
                      className="text-destructive focus:text-destructive"
                      disabled={workflows.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        {/* Add New Workflow Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="ml-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Workflow
        </Button>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Enter a name for your new workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="My Awesome Workflow"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkflow()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={!newWorkflowName.trim()}>
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Workflow Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Workflow</DialogTitle>
            <DialogDescription>
              Enter a new name for your workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rename-workflow-name">Workflow Name</Label>
              <Input
                id="rename-workflow-name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameWorkflow()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameWorkflow} disabled={!newWorkflowName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workflow Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorkflow}>
              Delete Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkflowTabs;