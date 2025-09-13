import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (captchaToken?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const authOptions: any = {
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    };

    if (captchaToken) {
      authOptions.options.captchaToken = captchaToken;
    }

    const { data, error } = await supabase.auth.signInWithOAuth(authOptions);

    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    if (data?.url) {
      // Open in new tab since iframe blocks top navigation
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }

    return { error: null };
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    return { error };
  };

  const signInWithInviteCode = async (inviteCode: string, captchaToken?: string) => {
    try {
      // Use RPC function to atomically validate and consume the invite code
      const { data: result, error: rpcError } = await supabase.rpc('use_invite_code', {
        code_to_use: inviteCode.trim()
      });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        return { error: { message: 'Failed to validate invite code' } };
      }

      // Cast the result to the expected type
      const inviteResult = result as { success: boolean; message: string } | null;

      // Check if the invite code validation was successful
      if (!inviteResult?.success) {
        return { error: { message: inviteResult?.message || 'Invalid invite code' } };
      }

      // Create an anonymous authenticated session
      const authOptions: any = {
        options: {
          data: {
            invite_code: inviteCode.trim().toUpperCase(),
            full_name: 'Invite User',
            auth_method: 'invite_code'
          }
        }
      };

      if (captchaToken) {
        authOptions.options.captchaToken = captchaToken;
      }

      const { data: authData, error: authError } = await supabase.auth.signInAnonymously(authOptions);

      if (authError) {
        console.error('Auth Error:', authError);
        return { error: { message: 'Failed to create session' } };
      }

      toast({
        title: "Welcome!",
        description: "Successfully signed in with invite code",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Invite code error:', error);
      return { error: { message: error.message || 'Failed to process invite code' } };
    }
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithInviteCode,
    signOut,
    isAuthenticated: !!user
  };
};