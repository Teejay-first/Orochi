import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_admin: boolean;
  is_super_admin: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, avatar_url, role, is_admin, is_super_admin')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when authenticated, clear when not
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (captchaToken?: string) => {
    // Build redirect back to Auth page preserving ?redirect=... and break out of iframe
    // Use the current window location to avoid cross-origin access to window.top in preview
    const redirectTo = `${window.location.origin}/auth${window.location.search || ''}`;

    const authOptions: any = {
      provider: 'google',
      options: {
        redirectTo,
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
      // Ensure navigation happens in the top window (not inside Lovable preview iframe)
      (window.top ?? window).location.href = data.url;
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
      const code = inviteCode.trim().toUpperCase();

      // 1) Create an anonymous authenticated session first (so we don't burn invite codes on failure)
      const authOptions: any = {
        options: {
          data: {
            invite_code: code,
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
        return { error: { message: authError.message || 'Failed to create session' } };
      }

      // 2) Now atomically decrement the invite code. If it fails, rollback by signing out.
      const { data: result, error: rpcError } = await supabase.rpc('use_invite_code', {
        code_to_use: code
      });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        await supabase.auth.signOut();
        return { error: { message: 'Failed to validate invite code' } };
      }

      const inviteResult = result as { success: boolean; message: string } | null;
      if (!inviteResult?.success) {
        await supabase.auth.signOut();
        return { error: { message: inviteResult?.message || 'Invalid invite code' } };
      }

      toast({
        title: 'Welcome!',
        description: 'Successfully signed in with invite code',
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
    userProfile,
    loading,
    signInWithGoogle,
    signInWithInviteCode,
    signOut,
    isAuthenticated: !!user,
    isAdmin: userProfile?.is_admin || false,
    isSuperAdmin: userProfile?.is_super_admin || false,
    userRole: userProfile?.role || 'user'
  };
};