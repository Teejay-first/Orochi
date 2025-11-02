# Database Migration Instructions

## Problem: "captcha verification process failed"

This error occurs because Supabase has CAPTCHA enabled for anonymous sign-ins. We need to disable it for development.

## Step 1: Disable CAPTCHA in Supabase

1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/gkfuepzqdzixejspfrlg/settings/auth)
2. Scroll to the "Auth Providers" section
3. Find "Anonymous Sign-ins" and click "Edit"
4. Toggle **"Enable anonymous sign-ins"** to **ON**
5. **CRITICAL:** Toggle **"Enable Captcha protection"** to **OFF**
6. Click "Save"

## Step 2: Run Database Migration

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/gkfuepzqdzixejspfrlg/sql/new)
2. Copy the entire contents of `supabase/migrations/20250115000000_multi_provider_support.sql`
3. Paste into the SQL Editor
4. Click "Run"

The migration will create these tables:
- `provider_connections` - Stores your Vapi/ElevenLabs/Orochi API keys
- `vapi_calls` - Stores call history and costs
- `vapi_phone_numbers` - Manages phone numbers
- `vapi_files` - Tracks knowledge base files

## Step 3: Verify Setup

1. Visit http://localhost:8081/diagnostic
2. All checks should show green checkmarks
3. If successful, click "Back to App"

## Troubleshooting

### If you still see "Not authenticated":
- Double-check that CAPTCHA protection is OFF (Step 1.5)
- Make sure anonymous sign-ins are enabled (Step 1.4)
- Clear your browser cache and cookies
- Try in an incognito/private browsing window

### If migration fails:
- Check if tables already exist (migration is idempotent, so it's safe to re-run)
- Look for specific error messages in the SQL Editor

### If tables are missing:
- Make sure you ran the entire migration file
- Check that the migration was executed successfully (no red error messages)

## Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/gkfuepzqdzixejspfrlg)
- [Auth Settings](https://supabase.com/dashboard/project/gkfuepzqdzixejspfrlg/settings/auth)
- [SQL Editor](https://supabase.com/dashboard/project/gkfuepzqdzixejspfrlg/sql/new)
- [Diagnostic Page](http://localhost:8081/diagnostic)
