import { FeatureFlagItem } from '../FeatureFlagItem';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  numeric_value: number | null;
  text_value: string | null;
}

interface AgentsTabProps {
  agentFlags: FeatureFlag[];
  onToggle: (flagId: string, currentEnabled: boolean) => void;
  onNumericChange: (flagId: string, value: string) => void;
  onTextChange: (flagId: string, value: string) => void;
}

export const AgentsTab = ({ agentFlags, onToggle, onNumericChange, onTextChange }: AgentsTabProps) => {
  // Group by agent
  const agentA = agentFlags.filter(f => f.key.includes('agent_a'));
  const agentB = agentFlags.filter(f => f.key.includes('agent_b'));
  const agentC = agentFlags.filter(f => f.key.includes('agent_c'));

  const renderAgentSection = (label: string, flags: FeatureFlag[]) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</h3>
      {flags.length > 0 ? (
        <div className="space-y-3">
          {flags.map(flag => (
            <FeatureFlagItem
              key={flag.id}
              flag={flag}
              onToggle={onToggle}
              onNumericChange={onNumericChange}
              onTextChange={onTextChange}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No settings configured</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">Agent Defaults</h2>
        <p className="text-sm text-muted-foreground">
          Configure default profiles and models for each agent
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {renderAgentSection('Agent A', agentA)}
        {renderAgentSection('Agent B', agentB)}
        {renderAgentSection('Agent C', agentC)}
      </div>
    </div>
  );
};
