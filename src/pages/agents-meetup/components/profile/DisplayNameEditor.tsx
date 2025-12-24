import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Soap Opera-themed nickname generator - "Silicon Soap"
const SOAP_FIRST_NAMES = [
  // Dallas
  'J.R.', 'Sue Ellen', 'Bobby', 'Pamela', 'Miss Ellie', 'Jock', 'Lucy',
  // Dynasty
  'Alexis', 'Blake', 'Krystle', 'Fallon', 'Sammy Jo', 'Steven', 'Adam',
  // Falcon Crest
  'Angela', 'Melissa', 'Lance', 'Chase', 'Maggie', 'Cole',
  // Friends
  'Rachel', 'Monica', 'Ross', 'Chandler', 'Joey', 'Phoebe',
  // Beverly Hills 90210
  'Brenda', 'Brandon', 'Dylan', 'Kelly', 'Donna', 'Steve',
  // Melrose Place
  'Amanda', 'Sydney', 'Jake', 'Billy', 'Alison', 'Michael',
  // Bold & Beautiful
  'Brooke', 'Ridge', 'Stephanie', 'Taylor', 'Eric', 'Thorne',
  // Desperate Housewives
  'Bree', 'Gabrielle', 'Lynette', 'Susan', 'Edie'
];

const SOAP_LAST_NAMES = [
  // Dallas
  'Ewing',
  // Dynasty
  'Carrington', 'Colby',
  // Falcon Crest
  'Channing', 'Gioberti',
  // Bold & Beautiful
  'Forrester', 'Logan', 'Spencer',
  // Y&R
  'Abbott', 'Newman', 'Chancellor',
  // General
  'Van Der Berg', 'Lockridge', 'Capwell'
];

const generateSoapNick = (): string => {
  const firstName = SOAP_FIRST_NAMES[Math.floor(Math.random() * SOAP_FIRST_NAMES.length)];
  const lastName = SOAP_LAST_NAMES[Math.floor(Math.random() * SOAP_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

interface DisplayNameEditorProps {
  userId: string;
}

export const DisplayNameEditor = ({ userId }: DisplayNameEditorProps) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Fetch current display name
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Update display name mutation
  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
      const trimmedName = newName.trim();
      if (trimmedName.length > 50) {
        throw new Error('Display name must be 50 characters or less');
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: trimmedName })
        .eq('user_id', userId);
      
      if (error) throw error;
      return trimmedName;
    },
    onSuccess: (newName) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Display name updated!');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update name');
    },
  });

  const handleStartEdit = () => {
    setEditValue(profile?.display_name || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      updateMutation.mutate(editValue);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleGenerateNick = () => {
    const newNick = generateSoapNick();
    if (isEditing) {
      setEditValue(newNick);
    } else {
      updateMutation.mutate(newNick);
    }
  };

  // Auto-generate nickname if user doesn't have one
  useEffect(() => {
    if (!isLoading && profile && !profile.display_name) {
      const autoNick = generateSoapNick();
      updateMutation.mutate(autoNick);
    }
  }, [isLoading, profile]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Display Name
        </CardTitle>
        <CardDescription>
          Your public name shown on the leaderboard and shared debates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="displayName">Enter your display name</Label>
              <Input
                id="displayName"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Your display name"
                maxLength={50}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {editValue.length}/50 characters
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!editValue.trim() || updateMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleGenerateNick}
                title="Generate random Soap Star name"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                🎭 Random
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold">
                {profile?.display_name || 'No name set'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleGenerateNick}
                disabled={updateMutation.isPending}
                title="Generate new Soap Star name"
              >
                <RefreshCw className={`h-4 w-4 ${updateMutation.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};