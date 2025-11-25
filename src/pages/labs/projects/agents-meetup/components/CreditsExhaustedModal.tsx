import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Sparkles, Key, LogIn } from 'lucide-react';

interface CreditsExhaustedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGuest: boolean;
  onApiKeySubmit?: (apiKey: string) => void;
}

export const CreditsExhaustedModal = ({
  open,
  onOpenChange,
  isGuest,
  onApiKeySubmit,
}: CreditsExhaustedModalProps) => {
  const [apiKey, setApiKey] = useState('');

  const handleApiKeySubmit = () => {
    if (apiKey.trim() && onApiKeySubmit) {
      onApiKeySubmit(apiKey.trim());
      setApiKey('');
      onOpenChange(false);
    }
  };

  if (isGuest) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              You've used your 3 free chats!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Sign up to get <span className="font-semibold text-primary">7 more credits</span> and unlock the ability to save conversations and analyze results.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
            <Link to="/auth" className="w-full">
              <Button className="w-full gap-2" size="lg">
                <LogIn className="h-4 w-4" />
                Sign Up for More Credits
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Key className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Out of Credits
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've used all your free credits. Add your OpenRouter API key to continue with unlimited usage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenRouter API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApiKeySubmit();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Don't have an API key?{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get one from OpenRouter
              </a>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleApiKeySubmit}
            disabled={!apiKey.trim()}
            className="w-full gap-2"
            size="lg"
          >
            <Key className="h-4 w-4" />
            Continue with My API Key
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};