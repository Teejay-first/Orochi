import React, { useState, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Turnstile } from '@marsidev/react-turnstile';

export const Auth: React.FC = () => {
  const { signInWithGoogle, signInWithInviteCode, isAuthenticated, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [inviteCode, setInviteCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const captchaRef = useRef<any>();
  
  const redirectTo = searchParams.get('redirect') || '/';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to intended page
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleGoogleSignIn = async () => {
    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const { error } = await signInWithGoogle(captchaToken);
    if (error) {
      console.error('Google sign-in error:', error);
    }
    // Reset CAPTCHA after attempt
    if (captchaRef.current) {
      captchaRef.current.reset();
      setCaptchaToken('');
    }
    setIsProcessing(false);
  };

  const handleInviteCodeSignIn = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const { error } = await signInWithInviteCode(inviteCode, captchaToken);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    // Reset CAPTCHA after attempt
    if (captchaRef.current) {
      captchaRef.current.reset();
      setCaptchaToken('');
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to VoiceTube</CardTitle>
          <CardDescription>
            Sign in to start conversations with AI agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isProcessing || !captchaToken}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            ) : (
              <LogIn className="w-5 h-5 mr-2" />
            )}
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInviteCodeSignIn();
                }
              }}
              disabled={isProcessing}
            />
            
            <div className="flex justify-center">
              <Turnstile
                ref={captchaRef}
                siteKey="0x4AAAAAAB1DkiFT9Z0eXpzt"
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken('')}
                onExpire={() => setCaptchaToken('')}
              />
            </div>
            
            <Button
              onClick={handleInviteCodeSignIn}
              disabled={isProcessing || !inviteCode.trim() || !captchaToken}
              className="w-full"
              variant="outline"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              ) : null}
              Sign in with Invite Code
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};