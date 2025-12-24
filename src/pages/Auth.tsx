import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Droplets, Loader2, MessageSquare } from 'lucide-react';
import { guestMigrationService } from '@/services/guestMigrationService';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const guestChatCount = guestMigrationService.getGuestChats().length;

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const from = (location.state as any)?.from?.pathname || '/new';
        navigate(from, { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate, location]);

  // Listen for auth state changes to trigger migration
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if there are guest chats to migrate
          if (guestMigrationService.hasGuestChats()) {
            setIsMigrating(true);
            try {
              const { success, failed } = await guestMigrationService.migrateGuestChats(session.user.id);
              if (success > 0) {
                toast.success(`Migrated ${success} conversation${success !== 1 ? 's' : ''} to your account!`);
              }
              if (failed > 0) {
                toast.warning(`${failed} conversation${failed !== 1 ? 's' : ''} could not be migrated.`);
              }
            } catch (error) {
              console.error('Migration error:', error);
            } finally {
              setIsMigrating(false);
            }
          }
          
          // Navigate after migration
          const from = (location.state as any)?.from?.pathname || '/new';
          navigate(from, { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/new`
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! You can now log in.');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // Navigation handled by onAuthStateChange after migration
  };

  if (checking || isMigrating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        {isMigrating && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Migrating your conversations...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-2 shadow-xl bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center gap-3">
            <Droplets className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SiliconSoap
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Sign in to save and access your conversation history
          </CardDescription>
          
          {/* Guest chat migration notice */}
          {guestChatCount > 0 && (
            <div className="flex items-center gap-2 justify-center text-sm text-primary bg-primary/10 rounded-lg py-2 px-3">
              <MessageSquare className="h-4 w-4" />
              <span>
                {guestChatCount} conversation{guestChatCount !== 1 ? 's' : ''} will be saved to your account
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
            <Button
              type="button"
              variant={!isSignUp ? "default" : "ghost"}
              className="rounded-md"
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={isSignUp ? "default" : "ghost"}
              className="rounded-md"
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-base bg-background/50"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
