import { useAgentProfiles } from '@/hooks/useAgentProfiles';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileSelectorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export const ProfileSelector = ({ label, value, onChange }: ProfileSelectorProps) => {
  const { profiles, isLoading } = useAgentProfiles();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-medium">{label}</Label>}
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a profile..." />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
