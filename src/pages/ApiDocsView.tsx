import { usePageMeta } from '@/hooks/usePageMeta';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Terminal, Key, Zap, Bot } from 'lucide-react';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_BASE = `${SUPABASE_URL}/functions/v1/debates-api`;

const CodeBlock = ({ code, lang = 'bash' }: { code: string; lang?: string }) => (
  <div className="relative group">
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs font-mono border">
      <code>{code}</code>
    </pre>
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => {
        navigator.clipboard.writeText(code);
        toast.success('Copied');
      }}
    >
      <Copy className="h-3 w-3" />
    </Button>
  </div>
);

const ApiDocsView = () => {
  usePageMeta({
    title: 'API Documentation',
    description:
      'Run SiliconSoap AI debates programmatically from Claude Cowork, n8n, or any HTTP client.',
    canonicalPath: '/api-docs',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-3">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" /> Beta
          </Badge>
          <h1 className="text-4xl font-bold">SiliconSoap REST API</h1>
          <p className="text-lg text-muted-foreground">
            Spin up dramatic AI debates from any agent, script, or workflow. Built for
            Claude Cowork, n8n, Zapier, and curious tinkerers.
          </p>
        </div>

        {/* Agent-friendly discovery */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Using this API with an AI agent?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Just paste <strong>this page's URL</strong> into Claude, ChatGPT, Cowork, or any
              agent with web access — they read the full table below and figure out the
              options on their own.
            </p>
            <p>For machine consumption, two no-auth endpoints exist:</p>
            <ul className="list-disc list-inside space-y-1 text-xs font-mono">
              <li><code>GET {API_BASE}/schema</code> — full JSON Schema of every endpoint + field</li>
              <li><code>GET {API_BASE}/llms.txt</code> — plain-text docs optimized for LLM ingestion</li>
            </ul>
            <CodeBlock code={`curl ${API_BASE}/schema\ncurl ${API_BASE}/llms.txt`} />
          </CardContent>
        </Card>

        {/* Quick start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Quick start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Go to <strong>Admin → API Keys</strong> and generate a key (starts with{' '}
                <code className="text-xs bg-muted px-1 rounded">sk_silicon_</code>).
              </li>
              <li>Copy the key — it's only shown once.</li>
              <li>Use it in the <code className="text-xs bg-muted px-1 rounded">Authorization</code> header.</li>
            </ol>
            <CodeBlock
              code={`# 1. Queue a debate (returns instantly with 202)
curl -X POST ${API_BASE}/debates \\
  -H "Authorization: Bearer sk_silicon_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Should AI agents have legal rights?",
    "models": ["qwen/qwen3-235b-a22b", "deepseek/deepseek-chat-v3.1"],
    "rounds": 2,
    "conversation_tone": "heated"
  }'
# => { "id": "abc-123", "status": "queued", "poll_url": "..." }

# 2. Poll status every 2-3s
curl ${API_BASE}/debates/abc-123/status \\
  -H "Authorization: Bearer sk_silicon_YOUR_KEY"
# => { "status": "running", "current_round": 1, "messages_so_far": 2 }

# 3. When status === "completed", fetch the transcript
curl ${API_BASE}/debates/abc-123 \\
  -H "Authorization: Bearer sk_silicon_YOUR_KEY"`}
            />

          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Every request needs an{' '}
              <code className="text-xs bg-muted px-1 rounded">Authorization</code> header:
            </p>
            <CodeBlock code={`Authorization: Bearer sk_silicon_<your-key>`} />
            <p className="text-muted-foreground">
              Keys are personal — debates count against your credit balance. Revoke
              compromised keys instantly from the admin panel.
            </p>
          </CardContent>
        </Card>

        {/* Base URL */}
        <Card>
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock code={API_BASE} />
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* GET /models */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <code className="font-mono text-sm">/models</code>
              </div>
              <p className="text-sm text-muted-foreground">
                List all curated models you can pass to <code>models</code> when creating a debate.
              </p>
              <CodeBlock
                code={`curl ${API_BASE}/models \\
  -H "Authorization: Bearer sk_silicon_..."`}
              />
              <p className="text-xs text-muted-foreground">Returns: <code>{`{ models: [{ model_id, display_name, provider, ... }] }`}</code></p>
            </section>

            {/* POST /debates */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>POST</Badge>
                <code className="font-mono text-sm">/debates</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Queue a debate. Returns <strong>202 Accepted instantly</strong> with an{' '}
                <code>id</code> — orchestration runs in the background so long debates never
                timeout. Poll <code>/debates/:id/status</code> for progress. Costs 1 credit.
                Append <code>?sync=true</code> to block until done (legacy behavior, can hit
                edge-function timeouts on long runs).
              </p>


              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Body parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border rounded">
                    <thead className="bg-muted">
                      <tr className="text-left">
                        <th className="p-2">Field</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Required</th>
                        <th className="p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      <tr className="border-t"><td className="p-2">topic</td><td className="p-2">string</td><td className="p-2">yes</td><td className="p-2">The debate topic (≤2000 chars)</td></tr>
                      <tr className="border-t"><td className="p-2">models</td><td className="p-2">string[]</td><td className="p-2">yes</td><td className="p-2">2 or 3 model_ids from <code>/models</code></td></tr>
                      <tr className="border-t"><td className="p-2">rounds</td><td className="p-2">number</td><td className="p-2">no</td><td className="p-2">1–5 (default 2)</td></tr>
                      <tr className="border-t"><td className="p-2">scenario_id</td><td className="p-2">string</td><td className="p-2">no</td><td className="p-2"><code>general-problem</code> | <code>ethical-dilemma</code> | <code>future-prediction</code></td></tr>
                      <tr className="border-t"><td className="p-2">personas</td><td className="p-2">string[]</td><td className="p-2">no</td><td className="p-2"><code>analytical</code> | <code>creative</code> | <code>strategic</code> | <code>empathetic</code></td></tr>
                      <tr className="border-t"><td className="p-2">agent_names</td><td className="p-2">string[]</td><td className="p-2">no</td><td className="p-2">Display names (default Agent A/B/C)</td></tr>
                      <tr className="border-t"><td className="p-2">response_length</td><td className="p-2">string</td><td className="p-2">no</td><td className="p-2"><code>short</code> | <code>medium</code> | <code>long</code></td></tr>
                      <tr className="border-t"><td className="p-2">conversation_tone</td><td className="p-2">string</td><td className="p-2">no</td><td className="p-2"><code>formal</code> | <code>casual</code> | <code>heated</code> | <code>collaborative</code></td></tr>
                      <tr className="border-t"><td className="p-2">agreement_bias</td><td className="p-2">number</td><td className="p-2">no</td><td className="p-2">0 (combative) – 100 (agreeable)</td></tr>
                      <tr className="border-t"><td className="p-2">personality_intensity</td><td className="p-2">string</td><td className="p-2">no</td><td className="p-2"><code>mild</code> | <code>moderate</code> | <code>extreme</code></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <CodeBlock
                code={`{
  "topic": "Should AI replace middle management?",
  "scenario_id": "ethical-dilemma",
  "models": ["openai/gpt-5-mini", "anthropic/claude-3.5-sonnet"],
  "personas": ["analytical", "creative"],
  "rounds": 3,
  "response_length": "medium",
  "conversation_tone": "heated",
  "agreement_bias": 20,
  "personality_intensity": "extreme"
}`}
                lang="json"
              />

              <p className="text-xs text-muted-foreground font-semibold">Example response (202 Accepted):</p>
              <CodeBlock
                lang="json"
                code={`{
  "id": "7a978df5-b45a-4e5d-86f9-f8d968f028e6",
  "status": "queued",
  "total_rounds": 3,
  "credits_remaining": 42,
  "poll_url": "/debates-api/debates/7a978df5-.../status",
  "message": "Debate queued. Poll GET /debates/:id/status every 2-3s..."
}`}
              />
            </section>

            {/* GET /debates/:id/status */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <code className="font-mono text-sm">/debates/:id/status</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Lightweight polling endpoint. Returns current run status without the full
                transcript. Poll every 2–3 seconds.
              </p>
              <CodeBlock
                code={`curl ${API_BASE}/debates/abc-123/status \\
  -H "Authorization: Bearer sk_silicon_..."`}
              />
              <p className="text-xs text-muted-foreground font-semibold">Example response:</p>
              <CodeBlock
                lang="json"
                code={`{
  "id": "7a978df5-...",
  "status": "running",
  "current_round": 2,
  "total_rounds": 3,
  "messages_so_far": 4,
  "error": null,
  "started_at": "2026-06-02T10:14:22Z",
  "completed_at": null
}`}
              />
            </section>



            {/* GET /debates */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <code className="font-mono text-sm">/debates</code>
              </div>
              <p className="text-sm text-muted-foreground">
                List your debates (latest first). Query param: <code>?limit=20</code> (max 100).
              </p>
              <CodeBlock
                code={`curl "${API_BASE}/debates?limit=10" \\
  -H "Authorization: Bearer sk_silicon_..."`}
              />
            </section>

            {/* GET /debates/:id */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <code className="font-mono text-sm">/debates/:id</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Fetch a single debate with all messages.
              </p>
              <CodeBlock
                code={`curl ${API_BASE}/debates/abc-123 \\
  -H "Authorization: Bearer sk_silicon_..."`}
              />
            </section>

          </CardContent>
        </Card>

        {/* Errors */}
        <Card>
          <CardHeader>
            <CardTitle>Error codes</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 font-mono">400</td><td className="py-2">Bad input (validation error in body)</td></tr>
                <tr className="border-b"><td className="py-2 font-mono">401</td><td className="py-2">Missing, malformed, or revoked API key</td></tr>
                <tr className="border-b"><td className="py-2 font-mono">402</td><td className="py-2">Out of credits</td></tr>
                <tr className="border-b"><td className="py-2 font-mono">404</td><td className="py-2">Resource not found / not yours</td></tr>
                <tr className="border-b"><td className="py-2 font-mono">502</td><td className="py-2">Upstream model failure mid-debate (partial messages may be saved)</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground pt-4">
          Need a feature? Open an issue or hit us up. This API is in active development.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocsView;
