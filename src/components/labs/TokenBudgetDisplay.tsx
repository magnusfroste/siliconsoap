import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { tokenService } from '@/services/tokenService';

interface TokenBudgetDisplayProps {
  tokensUsed: number;
  tokenBudget: number;
  loading?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const TokenBudgetDisplay = ({
  tokensUsed,
  tokenBudget,
  loading = false,
  showDetails = false,
  className = ''
}: TokenBudgetDisplayProps) => {
  const budgetRemaining = tokenBudget - tokensUsed;
  const usagePercentage = tokenService.getUsagePercentage(tokensUsed, tokenBudget);
  const isLow = usagePercentage >= 80;
  const isExhausted = budgetRemaining <= 0;

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Zap className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <Zap className={`h-4 w-4 ${isExhausted ? 'text-destructive' : isLow ? 'text-warning' : 'text-primary'}`} />
            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="flex items-center justify-between text-xs">
                <span className={isExhausted ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {tokenService.formatTokens(budgetRemaining)} left
                </span>
                {showDetails && (
                  <span className="text-muted-foreground/60">
                    {usagePercentage}%
                  </span>
                )}
              </div>
              <Progress 
                value={Math.min(usagePercentage, 100)} 
                className="h-1.5"
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="space-y-1">
            <p><strong>Token Budget</strong></p>
            <p>Used: {tokenService.formatTokens(tokensUsed)} / {tokenService.formatTokens(tokenBudget)}</p>
            <p>Remaining: {tokenService.formatTokens(budgetRemaining)}</p>
            {isLow && !isExhausted && (
              <p className="text-warning">Running low on tokens</p>
            )}
            {isExhausted && (
              <p className="text-destructive">Budget exhausted</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
