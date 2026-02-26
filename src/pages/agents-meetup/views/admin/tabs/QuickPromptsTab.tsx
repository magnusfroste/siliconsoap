import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Sparkles, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface QuickPrompt {
  id: string;
  topic: string;
  scenario_id: string;
  is_enabled: boolean;
  sort_order: number;
}

const SCENARIO_OPTIONS = [
  { value: 'general-problem', label: 'General' },
  { value: 'ethical-dilemma', label: 'Ethics' },
  { value: 'future-prediction', label: 'Future' },
  { value: 'hot-debates', label: 'Hot' },
];

export const QuickPromptsTab = () => {
  const [prompts, setPrompts] = useState<QuickPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  const [newScenario, setNewScenario] = useState('general-problem');
  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{ topic: string; scenario_id: string }[]>([]);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);

  const fetchPrompts = async () => {
    const { data, error } = await supabase
      .from('quick_prompts')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      toast.error('Failed to load prompts');
      console.error(error);
    } else {
      setPrompts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPrompts(); }, []);

  const handleAdd = async () => {
    if (!newTopic.trim()) return;
    setAdding(true);
    const { error } = await supabase
      .from('quick_prompts')
      .insert({ topic: newTopic.trim(), scenario_id: newScenario, sort_order: prompts.length });
    
    if (error) {
      toast.error('Failed to add prompt');
    } else {
      setNewTopic('');
      toast.success('Prompt added');
      fetchPrompts();
    }
    setAdding(false);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from('quick_prompts')
      .update({ is_enabled: enabled })
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update');
    } else {
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, is_enabled: enabled } : p));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('quick_prompts')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete');
    } else {
      setPrompts(prev => prev.filter(p => p.id !== id));
      toast.success('Prompt deleted');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('generate-trending-topics');
      if (error) throw error;
      const categorized = data?.categorized || {};
      const flat: { topic: string; scenario_id: string }[] = [];
      for (const [scenarioId, topics] of Object.entries(categorized)) {
        if (Array.isArray(topics)) {
          topics.forEach((t: string) => flat.push({ topic: t, scenario_id: scenarioId }));
        }
      }
      setSuggestions(flat);
      if (!flat.length) toast.info('No suggestions generated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate topics');
    }
    setGenerating(false);
  };

  const handleAddSuggestion = async (topic: string, scenarioId: string) => {
    setAddingSuggestion(topic);
    const { error } = await supabase
      .from('quick_prompts')
      .insert({ topic, scenario_id: scenarioId, sort_order: prompts.length });
    
    if (error) {
      toast.error('Failed to add');
    } else {
      setSuggestions(prev => prev.filter(s => s.topic !== topic));
      toast.success('Added');
      fetchPrompts();
    }
    setAddingSuggestion(null);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading prompts...</div>;

  return (
    <div className="space-y-6">
      {/* Add new prompt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Quick Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter a debate topic..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            />
            <Select value={newScenario} onValueChange={setNewScenario}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCENARIO_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={adding || !newTopic.trim()} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate trending */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI Trending Topics</CardTitle>
            <Button onClick={handleGenerate} disabled={generating} variant="outline" size="sm" className="gap-1">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </CardHeader>
        {suggestions.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              {suggestions.map((topic, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                  <span className="text-sm flex-1">{topic}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddSuggestion(topic)}
                    disabled={addingSuggestion === topic}
                    className="gap-1 shrink-0"
                  >
                    {addingSuggestion === topic ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Prompts list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Prompts ({prompts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead className="w-[100px]">Scenario</TableHead>
                <TableHead className="w-[80px]">Active</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{p.topic}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {SCENARIO_OPTIONS.find(s => s.value === p.scenario_id)?.label || p.scenario_id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.is_enabled}
                      onCheckedChange={(checked) => handleToggle(p.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {prompts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No prompts yet. Add one above or generate trending topics.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
