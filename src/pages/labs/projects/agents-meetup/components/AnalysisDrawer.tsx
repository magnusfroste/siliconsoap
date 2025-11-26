import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from '@/components/ui/drawer';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Sparkles, X, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnalysisResults } from '@/components/labs/conversation-analysis/components/AnalysisResults';
import { ConversationMessage } from '../types';

interface AnalysisDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAnalyzing: boolean;
  analysisResults: string;
  conversation: ConversationMessage[];
  onAnalyze: () => void;
  isGuest?: boolean;
}

export const AnalysisDrawer = ({
  open,
  onOpenChange,
  isAnalyzing,
  analysisResults,
  conversation,
  onAnalyze,
  isGuest = false
}: AnalysisDrawerProps) => {
  const [showStats, setShowStats] = useState(false);

  // Extract verdict (first paragraph) from analysis
  const getVerdict = (analysis: string) => {
    const lines = analysis.split('\n');
    const firstContent = lines.find(l => l.trim() && !l.startsWith('#'));
    return firstContent?.trim() || "Analyzing the conversation...";
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <DrawerTitle className="text-xl">Judge Bot</DrawerTitle>
                <DrawerDescription>Your AI conversation referee</DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          {!isAnalyzing && analysisResults && (
            <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">The Verdict</p>
                  <p className="text-sm text-muted-foreground italic">
                    "{getVerdict(analysisResults)}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="h-16 w-16 text-primary/30" />
                  </div>
                </div>
                <p className="text-lg font-medium">Judge Bot is analyzing...</p>
                <p className="text-sm text-muted-foreground">
                  Evaluating agent performances, checking scorecards... 🎭
                </p>
              </div>
            ) : !analysisResults ? (
              isGuest ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <LogIn className="h-16 w-16 text-muted-foreground" />
                  <p className="text-lg font-medium">Analysis requires sign in</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Sign in to unlock conversation analysis by Judge Bot and get insights, scores, and witty commentary!
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="mt-4">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In to Analyze
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Sparkles className="h-16 w-16 text-muted-foreground" />
                  <p className="text-lg font-medium">Ready to judge?</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Let Judge Bot analyze this conversation and provide insights, scores, and witty commentary!
                  </p>
                  <Button onClick={onAnalyze} size="lg" className="mt-4">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Conversation
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {/* Full Analysis - Always Visible */}
                <div className="p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50">
                  <div 
                    className="prose prose-sm max-w-none text-foreground dark:text-foreground"
                    dangerouslySetInnerHTML={{ 
                      __html: analysisResults
                        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 text-foreground">$1</h2>')
                        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-foreground">$1</h1>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^- (.+)$/gim, '<li class="ml-4">$1</li>')
                        .replace(/^\* (.+)$/gim, '<li class="ml-4">$1</li>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>

                {/* Nerd Stats - Collapsible at Bottom */}
                <Collapsible open={showStats} onOpenChange={setShowStats}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="font-medium">📊 Nerd Stats</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <AnalysisResults 
                      analysisResults={analysisResults}
                      conversation={conversation}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
