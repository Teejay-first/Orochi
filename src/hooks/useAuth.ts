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

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

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

  const signInWithInviteCode = async (inviteCode: string) => {
    try {
      // First, check if the invite code exists and has uses remaining
      const { data: codeData, error: fetchError } = await supabase
        .from('invite_codes')
        .select('id, uses_remaining')
        .eq('code', inviteCode.trim().toUpperCase())
        .single();

      if (fetchError || !codeData) {
        return { error: { message: 'Invalid invite code' } };
      }

      if (codeData.uses_remaining <= 0) {
        return { error: { message: 'This invite code has been used up' } };
      }

      // Create a temporary user session using email/password with invite code as identifier
      const tempEmail = `invite_${inviteCode.trim().toLowerCase()}@example.com`;
      const tempPassword = `temp_${Date.now()}_${Math.random()}`;
      const redirectUrl = `${window.location.origin}/`;

      // Sign up with temporary credentials
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            invite_code: inviteCode.trim().toUpperCase(),
            full_name: 'Invite User'
          }
        }
      });

      if (authError) {
        return { error: authError };
      }

      // Decrease the usage count
      const { error: updateError } = await supabase
        .from('invite_codes')
        .update({ uses_remaining: codeData.uses_remaining - 1 })
        .eq('id', codeData.id);

      if (updateError) {
        console.error('Failed to update invite code usage:', updateError);
      }

      toast({
        title: "Welcome!",
        description: "Successfully signed in with invite code",
      });

      return { error: null };
    } catch (error: any) {
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