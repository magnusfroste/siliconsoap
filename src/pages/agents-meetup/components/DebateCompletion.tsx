import { Link } from 'react-router-dom';
import { Copy, RotateCcw, Headphones, Linkedin, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DebateCompletion({ answers, rounds, shareId, saving, saveFailed = false, onRetrySave, title, prompt, onCopy, judgeEnabled, isGuest, onJudge, audioEnabled, onPlay, onTheater }: {
  answers: number; rounds: number; shareId?: string | null; saving: boolean; saveFailed?: boolean; onRetrySave?: () => void; title?: string; prompt: string; onCopy: () => void;
  judgeEnabled: boolean; isGuest: boolean; onJudge: () => void; audioEnabled: boolean; onPlay: () => void; onTheater: () => void;
}) {
  const shareUrl = shareId ? `https://siliconsoap.com/shared/${shareId}` : '';
  const base = (title || prompt).replace(/\s+/g, ' ').trim();
  const shareText = `AI models debate: ${base.length > 120 ? `${base.slice(0, 117).trimEnd()}…` : base}`;
  const social = (url: string) => window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  return <section className="debate-completion rounded-lg p-5 md:p-7" aria-label="Debate complete">
    <h2 className="font-display text-3xl font-semibold">Debate complete</h2>
    <p className="mt-2 text-sm opacity-75">{answers} answers in {rounds} round{rounds === 1 ? '' : 's'}. {saving ? 'Saving…' : saveFailed && !shareId ? <>Couldn't save this debate. <Button variant="link" className="completion-link h-auto p-0 align-baseline" onClick={onRetrySave}><RotateCcw className="mr-1 h-3.5 w-3.5" />Try again</Button></> : shareId ? <>Public and shareable at <span className="break-all font-mono text-xs">siliconsoap.com/shared/{shareId}</span></> : 'Not shared publicly.'}</p>
    <div className="mt-5 flex flex-wrap gap-2">
      <Button variant="secondary" className="h-11" onClick={onCopy} disabled={saving || !shareId}><Copy className="mr-2 h-4 w-4" />Copy share link</Button>
      <Button variant="outline" size="icon" className="completion-outline h-11 w-11" aria-label="Share debate on X" disabled={!shareId} onClick={() => social(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)}><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></Button>
      <Button variant="outline" size="icon" className="completion-outline h-11 w-11" aria-label="Share debate on LinkedIn" disabled={!shareId} onClick={() => social(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}><Linkedin className="h-4 w-4" /></Button>
      <Button asChild variant="outline" className="completion-outline min-h-11 whitespace-normal"><Link to={`/new?prompt=${encodeURIComponent(prompt)}`}>Rerun with a different cast</Link></Button>
    </div>
    {(judgeEnabled || audioEnabled) && <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {judgeEnabled && <div className="completion-tile rounded-lg p-4"><Scale className="mb-2 h-5 w-5" /><h3 className="font-semibold">Ask the judge</h3><p className="mt-1 text-xs opacity-75">An AI judge scores arguments, contradictions and who held their ground.</p>{isGuest ? <Button asChild variant="link" className="completion-link mt-2 h-auto whitespace-normal p-0 text-left"><Link to="/auth">Sign in to get the judge's verdict</Link></Button> : <Button variant="link" className="completion-link mt-2 h-auto p-0" onClick={onJudge}>Ask the judge</Button>}</div>}
      {audioEnabled && <div className="completion-tile rounded-lg p-4"><Headphones className="mb-2 h-5 w-5" /><h3 className="font-semibold">Listen to the debate</h3><p className="mt-1 text-xs opacity-75">Read aloud with a voice per agent, or play it as theater.</p><div className="mt-2 flex gap-4"><Button variant="link" className="completion-link h-auto p-0" onClick={onPlay}>Listen</Button><Button variant="link" className="completion-link h-auto p-0" onClick={onTheater}>Theater mode</Button></div></div>}
    </div>}
  </section>;
}