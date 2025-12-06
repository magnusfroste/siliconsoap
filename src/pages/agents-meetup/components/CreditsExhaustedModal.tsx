import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, LogIn, CreditCard } from 'lucide-react';

interface CreditsExhaustedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGuest: boolean;
}

export const CreditsExhaustedModal = ({
  open,
  onOpenChange,
  isGuest,
}: CreditsExhaustedModalProps) => {
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

  // Logged-in user out of credits - prompt to purchase
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Out of Credits
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've used all your free credits. Purchase more credits to continue creating amazing AI conversations.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
          <Button
            className="w-full gap-2"
            size="lg"
            disabled
          >
            <CreditCard className="h-4 w-4" />
            Purchase Credits (Coming Soon)
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
