import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';
import { PageHeader } from '@/components/editorial/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from 'next-themes';

export const SettingsView = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <div className="account-editorial max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12 space-y-6">
      <PageHeader eyebrow="Your preferences" title="Settings" lead="Account details and appearance." />
      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle className="font-display">Account</CardTitle></CardHeader><CardContent className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm break-all">{user?.email || 'Not signed in'}</p>{user && <Button variant="outline" className="min-h-11" onClick={signOut}>Sign out</Button>}</CardContent></Card>
      {/* Appearance */}
      <Card className="rounded-lg shadow-none">
        <CardHeader>
          <CardTitle className="font-display">Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversation Defaults */}
      <Card className="rounded-lg shadow-none">
        <CardHeader>
          <CardTitle className="font-display">Conversation Defaults</CardTitle>
          <CardDescription>
            Default settings are configured on the landing page when starting a new chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You can adjust the number of agents, conversation rounds, and response length each time you start a new conversation.
          </p>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="font-display">More Settings Coming Soon</CardTitle>
          <CardDescription>
            We're working on additional customization options including notifications, data export, and more
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
