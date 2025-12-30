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
import { ChevronDown, Sparkles, X, LogIn, Drama } from 'lucide-react';
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
  isSaved?: boolean;
}

export const AnalysisDrawer = ({
  open,
  onOpenChange,
  isAnalyzing,
  analysisResults,
  conversation,
  onAnalyze,
  isGuest = false,
  isSaved = false
}: AnalysisDrawerProps) => {
  const [showStats, setShowStats] = useState(false);

  // Extract verdict (first paragraph) from analysis
  const getVerdict = (analysis: string) => {
    const lines = analysis.split('\n');
    const firstContent = lines.find(l => l.trim() && !l.startsWith('#'));
    return firstContent?.trim() || "The verdict is being prepared...";
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] h-[85vh] flex flex-col">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  🎭
                </AvatarFallback>
              </Avatar>
              <div>
                <DrawerTitle className="text-xl">Judge Bot</DrawerTitle>
                <DrawerDescription className="italic">
                  Your unreliable but charming courtroom 🗡️
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          {/* Ironic disclaimer */}
          <p className="text-xs text-muted-foreground mt-2 italic">
            Can you trust an AI that judges other AIs? Absolutely not. But that's what makes it exciting!
          </p>

          {!isAnalyzing && analysisResults && (
            <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5 flex-shrink-0">🔨</span>
                <div>
                  <p className="font-semibold text-sm mb-1">The verdict is in!</p>
                  <p className="text-sm text-muted-foreground italic">
                    "{getVerdict(analysisResults)}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="py-6 space-y-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <span className="text-6xl animate-pulse">🎭</span>
                </div>
                <p className="text-lg font-medium">The Queen is gathering evidence...</p>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Examining alliances, counting backstabs, searching for hidden agendas... 👀
                </p>
                <p className="text-xs text-muted-foreground/70 italic">
                  (No one is innocent until proven otherwise. And not even then.)
                </p>
                <div className="mt-4 px-4 py-2 bg-muted/50 rounded-full">
                  <p className="text-xs text-muted-foreground">
                    ⏱️ This usually takes 15-30 seconds
                  </p>
                </div>
              </div>
            ) : !analysisResults ? (
              isGuest ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <LogIn className="h-16 w-16 text-muted-foreground" />
                  <p className="text-lg font-medium">The Verdict Requires Login</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Sign in to get Judge Bot's dramatic analysis - complete with backstabbing alerts, trust issues, and diva moments!
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="mt-4">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In for the Verdict
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <span className="text-6xl">🎭</span>
                  <p className="text-lg font-medium">Ready for the verdict?</p>
                  <p className="text-sm text-muted-foreground text-center max-w-sm italic">
                    (No one is innocent...)
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Let Judge Bot analyze this conversation and reveal who backstabbed, who played diva, and most importantly - who can you trust?
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Spoiler: probably no one.
                  </p>
                  <Button onClick={onAnalyze} size="lg" className="mt-4">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Deliver the Verdict
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
                      <span className="font-medium">📊 Nerd Stats (for those who love numbers)</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <AnalysisResults 
                      analysisResults={analysisResults}
                      conversation={conversation}
                      isSaved={isSaved}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
