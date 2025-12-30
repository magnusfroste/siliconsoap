import { FeatureFlagItem } from '../FeatureFlagItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Calculator } from 'lucide-react';

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
  // Separate flags by category
  const tokenPricingFlags = featureFlags.filter(f => 
    f.key === 'tokens_per_credit'
  );
  const creditFlags = featureFlags.filter(f => 
    (f.key.includes('credits') || f.key.includes('credit')) && f.key !== 'tokens_per_credit'
  );
  const otherFlags = featureFlags.filter(f => 
    !f.key.includes('credits') && !f.key.includes('credit') && f.key !== 'tokens_per_credit'
  );

  // Get tokens per credit for display
  const tokensPerCredit = tokenPricingFlags[0]?.numeric_value || 100000;
  const creditsPerMillion = Math.round(1000000 / tokensPerCredit);

  return (
    <div className="space-y-8">
      {/* Token Pricing Configuration */}
      <div className="space-y-4">
        <div className="pb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure how tokens convert to credits for billing
          </p>
        </div>
        
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Credit Calculator
            </CardTitle>
            <CardDescription>
              Current pricing: {tokensPerCredit.toLocaleString()} tokens = 1 credit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-background border">
                <div className="text-2xl font-bold text-primary">{creditsPerMillion}</div>
                <div className="text-xs text-muted-foreground">credits per 1M tokens</div>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <div className="text-2xl font-bold">{Math.round(tokensPerCredit / 1000)}K</div>
                <div className="text-xs text-muted-foreground">tokens per credit</div>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <div className="text-2xl font-bold">~{Math.round(tokensPerCredit / 10000)}</div>
                <div className="text-xs text-muted-foreground">debates per credit*</div>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <div className="text-2xl font-bold">~{Math.round(tokensPerCredit / 750)}</div>
                <div className="text-xs text-muted-foreground">words per credit*</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Estimates based on average debate sizes and typical model output
            </p>
          </CardContent>
        </Card>

        {tokenPricingFlags.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {tokenPricingFlags.map(flag => (
              <FeatureFlagItem
                key={flag.id}
                flag={flag}
                onToggle={onToggle}
                onNumericChange={onNumericChange}
                onTextChange={onTextChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Credits Configuration */}
      {creditFlags.length > 0 && (
        <div className="space-y-4">
          <div className="pb-2">
            <h2 className="text-lg font-semibold">Credits Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Manage free trial and initial credit settings
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
    </div>
  );
};
