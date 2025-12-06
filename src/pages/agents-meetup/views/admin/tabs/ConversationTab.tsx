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

interface ConversationTabProps {
  conversationFlags: FeatureFlag[];
  expertFlags: FeatureFlag[];
  onToggle: (flagId: string, currentEnabled: boolean) => void;
  onNumericChange: (flagId: string, value: string) => void;
  onTextChange: (flagId: string, value: string) => void;
}

export const ConversationTab = ({ 
  conversationFlags, 
  expertFlags, 
  onToggle, 
  onNumericChange, 
  onTextChange 
}: ConversationTabProps) => {
  return (
    <div className="space-y-8">
      {/* Conversation Settings */}
      <div className="space-y-4">
        <div className="pb-2">
          <h2 className="text-lg font-semibold">Conversation Settings</h2>
          <p className="text-sm text-muted-foreground">
            Default values for conversation parameters
          </p>
        </div>
        
        {conversationFlags.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {conversationFlags.map(flag => (
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
          <p className="text-sm text-muted-foreground">No conversation settings configured</p>
        )}
      </div>

      {/* Expert Settings */}
      <div className="space-y-4">
        <div className="pb-2">
          <h2 className="text-lg font-semibold">Expert Settings</h2>
          <p className="text-sm text-muted-foreground">
            Advanced conversation behavior parameters
          </p>
        </div>
        
        {expertFlags.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {expertFlags.map(flag => (
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
          <p className="text-sm text-muted-foreground">No expert settings configured</p>
        )}
      </div>
    </div>
  );
};
