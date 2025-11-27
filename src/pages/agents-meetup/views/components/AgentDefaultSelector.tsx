import { useAgentProfiles } from '@/hooks/useAgentProfiles';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgentDefaultSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const AgentDefaultSelector = ({ value, onChange }: AgentDefaultSelectorProps) => {
  const { profiles, isLoading } = useAgentProfiles();
  const selectedSlugs = value.split(',').map(s => s.trim()).filter(Boolean);

  const handleAddAgent = (slug: string) => {
    if (!selectedSlugs.includes(slug)) {
      const newSlugs = [...selectedSlugs, slug];
      onChange(newSlugs.join(','));
    }
  };

  const handleRemoveAgent = (slug: string) => {
    const newSlugs = selectedSlugs.filter(s => s !== slug);
    onChange(newSlugs.join(','));
  };

  const availableProfiles = profiles.filter(p => !selectedSlugs.includes(p.id));

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading agents...</div>;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Default Agents (in order)</Label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSlugs.map((slug, index) => {
          const profile = profiles.find(p => p.id === slug);
          if (!profile) return null;
          
          return (
            <Badge
              key={slug}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs opacity-60">Agent {String.fromCharCode(65 + index)}:</span>
              {profile.name}
              <button
                onClick={() => handleRemoveAgent(slug)}
                className="ml-1 rounded-full hover:bg-background/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      {availableProfiles.length > 0 && (
        <Select onValueChange={handleAddAgent}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Add agent..." />
          </SelectTrigger>
          <SelectContent>
            {availableProfiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
