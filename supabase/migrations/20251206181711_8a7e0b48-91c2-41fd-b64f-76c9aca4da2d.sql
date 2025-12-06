-- 1. Create a secure view for public shared chats that excludes user_id
CREATE OR REPLACE VIEW public.shared_chats_public AS
SELECT 
  id,
  title,
  prompt,
  scenario_id,
  settings,
  share_id,
  is_public,
  created_at,
  updated_at,
  deleted_at
  -- user_id is intentionally excluded for privacy
FROM public.agent_chats
WHERE is_public = true AND share_id IS NOT NULL;

-- 2. Add INSERT policy to user_profiles table
-- This allows users to create their own profile (backup for trigger)
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Create a security definer function to get shared chat without exposing user_id
CREATE OR REPLACE FUNCTION public.get_shared_chat(p_share_id text)
RETURNS TABLE (
  id uuid,
  title text,
  prompt text,
  scenario_id text,
  settings jsonb,
  share_id text,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    title,
    prompt,
    scenario_id,
    settings,
    share_id,
    is_public,
    created_at,
    updated_at,
    deleted_at
  FROM public.agent_chats
  WHERE agent_chats.share_id = p_share_id
  LIMIT 1;
$$;