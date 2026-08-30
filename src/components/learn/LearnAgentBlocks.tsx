import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, ExternalLink, Lightbulb, Sparkles } from 'lucide-react';
import { useLearnBlocks, type LearnBlock, type LearnTab } from '@/hooks/useLearnBlocks';

const BodyText = ({ body }: { body: string }) => {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean);
        const isList = lines.length > 0 && lines.every((line) => line.startsWith('- '));

        if (isList) {
          return (
            <ul key={index} className="space-y-1.5 list-disc pl-5">
              {lines.map((line, i) => (
                <li key={i}>{line.slice(2)}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{lines.join(' ')}</p>;
      })}
    </div>
  );
};

const BlockCard = ({ block }: { block: LearnBlock }) => {
  const meta = (block.meta ?? {}) as Record<string, string | undefined>;
  const isCallout = block.kind === 'callout';

  return (
    <Card className={isCallout ? 'border-primary/30 bg-primary/5' : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-start gap-2">
          {isCallout ? (
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          ) : block.kind === 'term' ? (
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          ) : null}
          <span>{block.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <BodyText body={block.body} />

        {meta.example && (
          <p className="text-xs text-muted-foreground/90 italic border-l-2 border-primary/40 pl-3">
            {meta.example}
          </p>
        )}

        {meta.url && (
          <Button variant="outline" size="sm" asChild>
            <a href={meta.url} target="_blank" rel="noopener noreferrer">
              {meta.url_label || 'Read more'}
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </a>
          </Button>
        )}

        {meta.source && (
          <p className="text-xs text-muted-foreground/70">Source: {meta.source}</p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Renders the agent-maintained blocks for a Learn tab. Silent when empty, so the
 * static crash course is unaffected until an agent publishes something.
 */
export const LearnAgentBlocks = ({ tab }: { tab: LearnTab }) => {
  const { blocks, loading } = useLearnBlocks(tab);

  if (loading || blocks.length === 0) return null;

  const latest = blocks.reduce(
    (newest, block) => (block.updated_at > newest ? block.updated_at : newest),
    blocks[0].updated_at,
  );

  return (
    <section className="mb-8 space-y-4" aria-label="Recently updated by maintenance agents">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <Bot className="h-3.5 w-3.5" />
          Maintained by AI agents
        </Badge>
        <span className="text-xs text-muted-foreground">
          Updated {new Date(latest).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className={`grid gap-4 ${blocks.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {blocks.map((block) => (
          <BlockCard key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
};
