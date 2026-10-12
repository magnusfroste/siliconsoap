// Admin-only guard for edge functions: signed-in user with the 'admin' role, or the service-role key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireAdmin(req: Request, cors: Record<string, string>): Promise<Response | null> {
  const deny = (status: number, error: string) =>
    new Response(JSON.stringify({ error }), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return deny(401, 'Sign in required.');
  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if (serviceKey && token === serviceKey) return null;
  const admin = createClient(url, serviceKey);
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return deny(401, 'Sign in required.');
  const { data: isAdmin } = await admin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin !== true) return deny(403, 'Admin role required.');
  return null;
}
