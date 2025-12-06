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

interface FeaturesTabProps {
  featureFlags: FeatureFlag[];
  onToggle: (flagId: string, currentEnabled: boolean) => void;
  onNumericChange: (flagId: string, value: string) => void;
  onTextChange: (flagId: string, value: string) => void;
}

export const FeaturesTab = ({ featureFlags, onToggle, onNumericChange, onTextChange }: FeaturesTabProps) => {
  // Separate credit-related flags
  const creditFlags = featureFlags.filter(f => 
    f.key.includes('credits') || f.key.includes('credit')
  );
  const otherFlags = featureFlags.filter(f => 
    !f.key.includes('credits') && !f.key.includes('credit')
  );

  return (
    <div className="space-y-8">
      {/* Feature Toggles */}
      <div className="space-y-4">
        <div className="pb-2">
          <h2 className="text-lg font-semibold">Feature Toggles</h2>
          <p className="text-sm text-muted-foreground">
            Enable or disable application features
          </p>
        </div>
        
        {otherFlags.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {otherFlags.map(flag => (
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
          <p className="text-sm text-muted-foreground">No feature toggles configured</p>
        )}
      </div>

      {/* Credits Configuration */}
      {creditFlags.length > 0 && (
        <div className="space-y-4">
          <div className="pb-2">
            <h2 className="text-lg font-semibold">Credits Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Manage free trial and credit settings
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {creditFlags.map(flag => (
              <FeatureFlagItem
                key={flag.id}
                flag={flag}
                onToggle={onToggle}
                onNumericChange={onNumericChange}
                onTextChange={onTextChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
