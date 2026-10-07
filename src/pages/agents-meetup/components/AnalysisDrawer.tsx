import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Loader2, Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AnalysisResults } from '@/components/labs/conversation-analysis/components/AnalysisResults';
import { JudgeVerdict } from './JudgeVerdict';
import type { ConversationMessage } from '../types';

interface AnalysisDrawerProps {
  open: boolean; onOpenChange: (open: boolean) => void; isAnalyzing: boolean; analysisResults: string;
  conversation: ConversationMessage[]; onAnalyze: () => void; isGuest?: boolean; isSaved?: boolean;
}
export function AnalysisDrawer({ open, onOpenChange, isAnalyzing, analysisResults, conversation, onAnalyze, isGuest = false, isSaved = false }: AnalysisDrawerProps) {
  const [showStats, setShowStats] = useState(false);
  return <Drawer open={open} onOpenChange={onOpenChange}><DrawerContent className="flex h-[85vh] max-h-[85vh] flex-col bg-background">
    <DrawerHeader className="border-b"><div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3"><div className="flex items-center gap-3"><Scale className="h-7 w-7 text-primary" /><div><DrawerTitle className="font-display text-2xl">The judge's verdict</DrawerTitle><DrawerDescription>AI-generated · may be wrong</DrawerDescription></div></div><DrawerClose asChild><Button variant="ghost" size="icon" aria-label="Close judge's verdict"><X className="h-4 w-4" /></Button></DrawerClose></div></DrawerHeader>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6"><div className="mx-auto max-w-4xl space-y-5">
      {isAnalyzing ? <div className="flex flex-col items-center gap-4 py-12" aria-live="polite"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="font-display text-2xl">Judging the debate…</p><p className="text-sm text-muted-foreground">Evaluating arguments, contradictions and who held their ground.</p></div> : !analysisResults ? <div className="space-y-4 py-12 text-center"><Scale className="mx-auto h-10 w-10 text-primary" /><h2 className="font-display text-2xl">Ask the judge</h2><p className="text-sm text-muted-foreground">An AI judge scores arguments, contradictions and who held their ground.</p>{isGuest ? <Button asChild><Link to="/auth">Sign in to get the judge's verdict</Link></Button> : <Button onClick={onAnalyze}>Judge the debate</Button>}</div> : <><JudgeVerdict analysis={analysisResults} /><Collapsible open={showStats} onOpenChange={setShowStats}><CollapsibleTrigger asChild><Button variant="outline" className="w-full justify-between">Debate statistics and export<ChevronDown className="h-4 w-4" /></Button></CollapsibleTrigger><CollapsibleContent className="mt-4"><AnalysisResults analysisResults={analysisResults} conversation={conversation} isSaved={isSaved} /></CollapsibleContent></Collapsible></>}
    </div></div>
  </DrawerContent></Drawer>;
}
