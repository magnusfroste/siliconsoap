import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Copy, Plus, Loader2, Key, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key_plaintext: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

/**
 * Generate a cryptographically random API key in the format
 * `sk_silicon_<48 base62 chars>` and return its SHA-256 hex hash.
 */
async function generateKey(): Promise<{ plaintext: string; hash: string; prefix: string }> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  const plaintext = `sk_silicon_${body}`;

  const data = new TextEncoder().encode(plaintext);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { plaintext, hash, prefix: plaintext.slice(0, 16) };
}

export const ApiKeysTab = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const fetchKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, key_plaintext, last_used_at, revoked_at, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load API keys');
      console.error(error);
    } else {
      setKeys(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Give the key a name first');
      return;
    }
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not signed in');
        return;
      }
      const { plaintext, hash, prefix } = await generateKey();
      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        name: newName.trim(),
        key_prefix: prefix,
        key_hash: hash,
        key_plaintext: plaintext,
      });
      if (error) throw error;

      setRevealedKey(plaintext);
      setNewName('');
      fetchKeys();
    } catch (e: any) {
      toast.error(`Failed to create key: ${e.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error('Failed to revoke');
    } else {
      toast.success('Key revoked');
      fetchKeys();
    }
    setConfirmRevokeId(null);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Generate keys to let external agents (Claude Cowork, n8n, scripts) create
                debates programmatically via the REST API.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/api-docs" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                API Docs
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Key name (e.g. 'Claude Cowork')"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={creating}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-2">Create key</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No API keys yet. Create one above to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="font-mono text-xs">{k.key_prefix}…</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {k.last_used_at
                        ? new Date(k.last_used_at).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {k.revoked_at ? (
                        <Badge variant="destructive">Revoked</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!k.revoked_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmRevokeId(k.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reveal dialog — only chance to see the plaintext key */}
      <AlertDialog open={!!revealedKey} onOpenChange={(o) => !o && setRevealedKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your new API key</AlertDialogTitle>
            <AlertDialogDescription>
              Copy this now — it won't be shown again. Treat it like a password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted rounded p-3 font-mono text-xs break-all border">
            {revealedKey}
          </div>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => revealedKey && copyKey(revealedKey)}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <AlertDialogAction onClick={() => setRevealedKey(null)}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke confirmation */}
      <AlertDialog
        open={!!confirmRevokeId}
        onOpenChange={(o) => !o && setConfirmRevokeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              Any service using this key will immediately lose access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRevokeId && handleRevoke(confirmRevokeId)}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
