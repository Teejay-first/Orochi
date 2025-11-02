// Diagnostic page to check database setup
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  details?: string;
}

export function Diagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([
    { name: 'Supabase Connection', status: 'checking', message: 'Checking...' },
    { name: 'Anonymous Auth', status: 'checking', message: 'Checking...' },
    { name: 'provider_connections Table', status: 'checking', message: 'Checking...' },
    { name: 'Migration Status', status: 'checking', message: 'Checking...' },
  ]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    // Test 1: Supabase connection
    try {
      const { data, error } = await supabase.from('agents').select('count', { count: 'exact', head: true });
      updateResult(0, {
        status: 'success',
        message: 'Connected to Supabase',
        details: `Can access database. Count: ${data}`,
      });
    } catch (err) {
      updateResult(0, {
        status: 'error',
        message: 'Cannot connect to Supabase',
        details: err instanceof Error ? err.message : String(err),
      });
    }

    // Test 2: Anonymous auth
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        updateResult(1, {
          status: 'success',
          message: 'Already authenticated',
          details: `User ID: ${user.id}`,
        });
      } else {
        // Try to sign in anonymously
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

        if (authError) {
          updateResult(1, {
            status: 'error',
            message: 'Anonymous auth failed',
            details: authError.message + '\n\nPlease enable anonymous auth in Supabase Dashboard:\nAuthentication → Providers → Anonymous → Enable',
          });
        } else {
          updateResult(1, {
            status: 'success',
            message: 'Anonymous auth successful',
            details: `User ID: ${authData.user.id}`,
          });
        }
      }
    } catch (err) {
      updateResult(1, {
        status: 'error',
        message: 'Anonymous auth error',
        details: err instanceof Error ? err.message : String(err),
      });
    }

    // Test 3: Check if provider_connections table exists
    try {
      const { data, error } = await supabase
        .from('provider_connections')
        .select('count', { count: 'exact', head: true });

      if (error) {
        updateResult(2, {
          status: 'error',
          message: 'Table does not exist',
          details: error.message + '\n\nPlease run the migration in Supabase Dashboard:\nSQL Editor → New Query → Paste migration SQL → Run',
        });
      } else {
        updateResult(2, {
          status: 'success',
          message: 'Table exists',
          details: `Found provider_connections table`,
        });
      }
    } catch (err) {
      updateResult(2, {
        status: 'error',
        message: 'Cannot check table',
        details: err instanceof Error ? err.message : String(err),
      });
    }

    // Test 4: Check other migration tables
    try {
      const tables = ['vapi_calls', 'vapi_phone_numbers', 'vapi_files'];
      const checks = await Promise.all(
        tables.map(table =>
          supabase.from(table).select('count', { count: 'exact', head: true })
        )
      );

      const allExist = checks.every(({ error }) => !error);

      if (allExist) {
        updateResult(3, {
          status: 'success',
          message: 'All migration tables exist',
          details: `Found: ${tables.join(', ')}`,
        });
      } else {
        const missing = tables.filter((_, i) => checks[i].error);
        updateResult(3, {
          status: 'error',
          message: 'Some migration tables missing',
          details: `Missing: ${missing.join(', ')}`,
        });
      }
    } catch (err) {
      updateResult(3, {
        status: 'error',
        message: 'Cannot check migration tables',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  function updateResult(index: number, update: Partial<DiagnosticResult>) {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], ...update };
      return newResults;
    });
  }

  function getStatusIcon(status: DiagnosticResult['status']) {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">VoxHive Setup Diagnostics</h1>
          <p className="text-muted-foreground mt-2">
            Running checks to diagnose the "Not authenticated" error
          </p>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                </div>
                <CardDescription>{result.message}</CardDescription>
              </CardHeader>
              {result.details && (
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto">
                    {result.details}
                  </pre>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button onClick={runDiagnostics} variant="outline">
            Re-run Diagnostics
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            Back to App
          </Button>
        </div>

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Enable Anonymous Auth & Disable CAPTCHA</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to your Supabase Dashboard: <a href="https://supabase.com/dashboard/project/gkfuepzqdzixejspfrlg/settings/auth" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open Auth Settings</a></li>
                <li>Scroll to "Auth Providers" section</li>
                <li>Find "Anonymous Sign-ins" and click "Edit"</li>
                <li>Toggle "Enable anonymous sign-ins" to <strong>ON</strong></li>
                <li><strong className="text-red-600">CRITICAL:</strong> Toggle "Enable Captcha protection" to <strong>OFF</strong></li>
                <li>Click "Save"</li>
              </ol>
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Why disable CAPTCHA?</strong> The error "captcha verification process failed" happens because CAPTCHA is enabled for anonymous sign-ins. For development, we need to disable it.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Run Database Migration</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to SQL Editor: <a href="https://supabase.com/dashboard/project/gkfuepzqdzixejspfrlg/sql/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open SQL Editor</a></li>
                <li>Copy the migration SQL from: <code className="bg-muted px-1 py-0.5 rounded">supabase/migrations/20250115000000_multi_provider_support.sql</code></li>
                <li>Paste into the SQL Editor</li>
                <li>Click "Run"</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Refresh This Page</h3>
              <p className="text-muted-foreground">After completing steps 1 & 2, click "Re-run Diagnostics" above</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
