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
import { Link } from 'react-router-dom';
import { Sparkles, LogIn, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchaseCredits = async () => {
    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-credits-checkout', {
        body: { packId: 'pack_50' },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsPurchasing(false);
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

        <div className="border rounded-lg p-4 bg-muted/30 my-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">50 Credits Pack</p>
              <p className="text-sm text-muted-foreground">Generate ~50 AI conversations</p>
            </div>
            <p className="text-2xl font-bold">$4.99</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handlePurchaseCredits}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {isPurchasing ? 'Starting Checkout...' : 'Purchase Credits'}
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
