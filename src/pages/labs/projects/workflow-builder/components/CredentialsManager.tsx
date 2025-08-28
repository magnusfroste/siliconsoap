import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Key,
  Bot,
  Globe,
  Mail,
  Database,
  Cloud,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Credential {
  id: string;
  name: string;
  type: string;
  service: string;
  apiKey?: string;
  lastUpdated: Date;
  created: Date;
  isActive: boolean;
  icon: React.ReactNode;
}

interface CredentialsManagerProps {
  onCredentialsChange: (hasCredentials: boolean) => void;
}

const CredentialsManager: React.FC<CredentialsManagerProps> = ({ onCredentialsChange }) => {
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: 'openrouter-1',
      name: 'OpenRouter API',
      type: 'API Key',
      service: 'OpenRouter',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 18), // 18 minutes ago
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
      isActive: false,
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [newCredential, setNewCredential] = useState({
    name: '',
    type: 'openrouter',
    apiKey: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const credentialTypes = [
    { value: 'openrouter', label: 'OpenRouter API', icon: <Bot className="h-4 w-4" /> },
    { value: 'openai', label: 'OpenAI API', icon: <Bot className="h-4 w-4" /> },
    { value: 'anthropic', label: 'Anthropic API', icon: <Bot className="h-4 w-4" /> },
    { value: 'http', label: 'HTTP Request', icon: <Globe className="h-4 w-4" /> },
    { value: 'database', label: 'Database', icon: <Database className="h-4 w-4" /> },
    { value: 'email', label: 'Email Service', icon: <Mail className="h-4 w-4" /> },
    { value: 'cloud', label: 'Cloud Storage', icon: <Cloud className="h-4 w-4" /> },
  ];

  const filteredCredentials = credentials.filter(cred =>
    cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCredentials = [...filteredCredentials].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return b.created.getTime() - a.created.getTime();
      case 'lastUpdated':
      default:
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
    }
  });

  const handleCreateCredential = () => {
    if (!newCredential.name.trim() || !newCredential.apiKey.trim()) return;

    const typeConfig = credentialTypes.find(t => t.value === newCredential.type);
    const credential: Credential = {
      id: `cred-${Date.now()}`,
      name: newCredential.name.trim(),
      type: 'API Key',
      service: typeConfig?.label || 'Unknown',
      apiKey: newCredential.apiKey.trim(),
      lastUpdated: new Date(),
      created: new Date(),
      isActive: true,
      icon: typeConfig?.icon || <Key className="h-6 w-6" />,
    };

    setCredentials(prev => [...prev, credential]);
    setNewCredential({ name: '', type: 'openrouter', apiKey: '' });
    setShowCreateDialog(false);
    
    // Update parent component about credentials availability
    onCredentialsChange(true);
  };

  const handleEditCredential = (credential: Credential) => {
    setSelectedCredential(credential);
    setNewCredential({
      name: credential.name,
      type: credential.service.toLowerCase().replace(/\s+/g, ''),
      apiKey: credential.apiKey || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateCredential = () => {
    if (!selectedCredential || !newCredential.name.trim() || !newCredential.apiKey.trim()) return;

    const typeConfig = credentialTypes.find(t => t.value === newCredential.type);
    
    setCredentials(prev => prev.map(cred => 
      cred.id === selectedCredential.id 
        ? {
            ...cred,
            name: newCredential.name.trim(),
            service: typeConfig?.label || 'Unknown',
            apiKey: newCredential.apiKey.trim(),
            lastUpdated: new Date(),
            isActive: true,
            icon: typeConfig?.icon || <Key className="h-6 w-6" />,
          }
        : cred
    ));

    setSelectedCredential(null);
    setNewCredential({ name: '', type: 'openrouter', apiKey: '' });
    setShowEditDialog(false);
    onCredentialsChange(true);
  };

  const handleDeleteCredential = () => {
    if (!selectedCredential) return;

    setCredentials(prev => prev.filter(cred => cred.id !== selectedCredential.id));
    setSelectedCredential(null);
    setShowDeleteDialog(false);
    
    // Check if any credentials remain
    const remainingCredentials = credentials.filter(cred => cred.id !== selectedCredential.id);
    onCredentialsChange(remainingCredentials.some(cred => cred.isActive));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">Credentials</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys and authentication credentials
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 p-6 border-b">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastUpdated">Sort by last updated</SelectItem>
            <SelectItem value="created">Sort by created</SelectItem>
            <SelectItem value="name">Sort by name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Credentials List */}
      <div className="flex-1 p-6 space-y-4">
        {sortedCredentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No credentials found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No credentials match your search.' : 'Get started by adding your first credential.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            )}
          </div>
        ) : (
          sortedCredentials.map((credential) => (
            <Card key={credential.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-lg">
                    {credential.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{credential.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {credential.service} {credential.type}
                      {credential.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Personal
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCredential(credential)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(credential.apiKey || '')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy API Key
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedCredential(credential);
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Last updated {formatTimeAgo(credential.lastUpdated)} • Created {formatDate(credential.created)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Credential Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Credential</DialogTitle>
            <DialogDescription>
              Add a new API key or authentication credential for your workflows.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cred-name">Name</Label>
              <Input
                id="cred-name"
                value={newCredential.name}
                onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My API Key"
              />
            </div>
            <div>
              <Label htmlFor="cred-type">Type</Label>
              <Select value={newCredential.type} onValueChange={(value) => setNewCredential(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {credentialTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cred-key">API Key</Label>
              <div className="relative">
                <Input
                  id="cred-key"
                  type={showApiKey ? "text" : "password"}
                  value={newCredential.apiKey}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCredential} disabled={!newCredential.name.trim() || !newCredential.apiKey.trim()}>
              Add Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Credential Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credential</DialogTitle>
            <DialogDescription>
              Update your credential information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-cred-name">Name</Label>
              <Input
                id="edit-cred-name"
                value={newCredential.name}
                onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My API Key"
              />
            </div>
            <div>
              <Label htmlFor="edit-cred-type">Type</Label>
              <Select value={newCredential.type} onValueChange={(value) => setNewCredential(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {credentialTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-cred-key">API Key</Label>
              <div className="relative">
                <Input
                  id="edit-cred-key"
                  type={showApiKey ? "text" : "password"}
                  value={newCredential.apiKey}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCredential} disabled={!newCredential.name.trim() || !newCredential.apiKey.trim()}>
              Update Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Credential Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credential</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCredential?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCredential}>
              Delete Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CredentialsManager;