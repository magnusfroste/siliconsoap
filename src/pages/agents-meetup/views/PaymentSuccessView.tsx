import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const PaymentSuccessView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [creditsAdded, setCreditsAdded] = useState(0);

  const sessionId = searchParams.get('session_id');
  const credits = searchParams.get('credits');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-credits-payment', {
          body: { sessionId },
        });

        if (error) throw error;

        if (data?.success) {
          setCreditsAdded(data.credits_added || parseInt(credits || '0', 10));
          setStatus('success');
        } else {
          throw new Error('Verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, credits]);

  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle>Verifying Payment...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please wait while we confirm your purchase.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle>Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
            <Button onClick={() => navigate('/new')} className="w-full">
              Return to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-4xl font-bold text-primary">+{creditsAdded}</p>
            <p className="text-sm text-muted-foreground">credits added to your account</p>
          </div>
          
          <p className="text-muted-foreground">
            Thank you for your purchase! Your credits are ready to use.
          </p>

          <Button onClick={() => navigate('/new')} className="w-full" size="lg">
            Start a New Conversation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
