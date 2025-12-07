-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can insert analytics" ON chat_analytics;

-- Recreate as a PERMISSIVE policy (default) so anonymous users can insert
CREATE POLICY "Anyone can insert analytics" 
ON chat_analytics 
FOR INSERT 
TO public
WITH CHECK (true);