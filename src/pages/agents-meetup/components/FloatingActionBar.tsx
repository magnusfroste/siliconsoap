import { Headphones, Sparkles, Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FloatingActionBarProps {
  // Audio props
  audioEnabled: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isGeneratingAudio: boolean;
  currentMessageIndex: number;
  totalMessages: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  
  // Analysis props
  canAnalyze: boolean;
  analysisScore?: string;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const FloatingActionBar = ({
  audioEnabled,
  isPlaying,
  isPaused,
  isGeneratingAudio,
  currentMessageIndex,
  totalMessages,
  onPlay,
  onPause,
  onStop,
  canAnalyze,
  analysisScore,
  isAnalyzing,
  onAnalyze,
}: FloatingActionBarProps) => {
  const showPlaybackControls = isPlaying || isPaused;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed bottom-6 right-6 z-50">
        <div 
          className={cn(
            "bg-background/80 backdrop-blur-md border rounded-full shadow-lg transition-all duration-300",
            showPlaybackControls ? "px-4 py-2" : "px-2 py-2"
          )}
        >
          <div className="flex items-center gap-2">
            {/* Audio Section */}
            {audioEnabled && (
              <>
                {!showPlaybackControls ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onPlay}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-accent"
                        disabled={totalMessages === 0}
                      >
                        <Headphones className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Listen to Debate</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={isPaused ? onPlay : onPause}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          disabled={isGeneratingAudio}
                        >
                          {isPaused ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{isPaused ? 'Resume' : 'Pause'}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={onStop}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Stop</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-sm text-muted-foreground px-2">
                      {isGeneratingAudio ? 'Generating...' : `${currentMessageIndex + 1}/${totalMessages}`}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Divider */}
            {audioEnabled && canAnalyze && (
              <div className="h-6 w-px bg-border" />
            )}

            {/* Analysis Section */}
            {canAnalyze && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onAnalyze}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full hover:bg-accent relative",
                      !isAnalyzing && !showPlaybackControls && "animate-pulse hover:animate-none"
                    )}
                    disabled={isAnalyzing}
                  >
                    <Sparkles className="h-5 w-5" />
                    {analysisScore && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
                      >
                        {analysisScore}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isAnalyzing ? 'Analyzing...' : 'Analyze with Judge Bot'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
