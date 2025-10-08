import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple local dev user state for testing
const LOCAL_DEV_USER = {
  id: 'local-dev-user-' + Date.now(),
  email: 'dev@localhost',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    full_name: 'Local Dev User',
    auth_method: 'local_dev',
    is_local_dev: true
  },
  aud: 'authenticated',
  role: 'authenticated'
};

export const createLocalDevSession = () => {
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (!isLocalDev) {
    return null;
  }

  // Store in localStorage for persistence
  const sessionData = {
    user: LOCAL_DEV_USER,
    access_token: 'local-dev-token-' + Date.now(),
    refresh_token: 'local-dev-refresh',
    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };

  localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));

  return sessionData;
};

export const clearLocalDevSession = () => {
  localStorage.removeItem('supabase.auth.token');
};
