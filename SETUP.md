# VoxHive Multi-Provider Dashboard - Setup Guide

## Overview

This guide will help you set up the VoxHive multi-provider dashboard with Vapi integration.

## Database Migration

The project now includes multi-provider support. You need to run the migration to add the necessary tables.

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `/supabase/migrations/20250115000000_multi_provider_support.sql`
5. Paste and click **Run**

### Option 2: Supabase CLI (if using local development)

```bash
npx supabase db reset
```

## New Tables Created

The migration creates the following tables:

- **`provider_connections`** - Stores API keys for Vapi, ElevenLabs, Orochi
- **`vapi_calls`** - Historical call records from Vapi
- **`vapi_phone_numbers`** - Phone numbers from Vapi
- **`vapi_files`** - Knowledge base files from Vapi

It also adds sync tracking fields to the existing `agents` table:
- `provider_connection_id`
- `provider_assistant_id`
- `sync_status`
- `last_synced_at`
- `last_synced_hash`
- `local_changes`
- `sync_error`

## Getting Started

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to /start

Visit `http://localhost:8080/start` to begin the onboarding flow.

### 3. Add Your Vapi API Key

Use the provided test key or your own:
- **Test Key**: `413505b8-d790-478e-8b14-86bb93450c35`

The onboarding flow will:
1. Validate your API key
2. Store it securely in Supabase
3. Fetch your existing Vapi assistants (if importing)
4. Redirect you to the dashboard

## New Features

### 1. Multi-Provider Support
- Connect multiple Vapi organizations
- Support for ElevenLabs (coming soon)
- Support for Orochi Pipeline (coming soon)

### 2. Sync Engine
- Track local changes vs remote
- Review changes before syncing
- Auto-detect remote changes

### 3. Updated Navigation
- **BUILD**: Assistants, Knowledge Base, Tools
- **DEPLOY**: Phone Numbers, Webhooks
- **MONITOR**: Usage & Cost, Call History, Analytics
- **SETTINGS**: Provider Connections

### 4. Usage & Cost Analytics
- Real-time cost tracking
- Per-assistant breakdown
- Daily/monthly trends

## API Integration

The dashboard now uses real Vapi API endpoints:

- `GET /assistant` - List assistants
- `POST /assistant` - Create assistant
- `PATCH /assistant/{id}` - Update assistant
- `GET /call` - List calls
- `GET /phone-number` - List phone numbers
- `GET /file` - List files

## Testing Call Functionality

Calls can be tested directly in the dashboard (coming in next phase):
1. Navigate to an assistant
2. Click "Test Call"
3. Speak with the assistant in real-time
4. View call logs in Usage & Cost

## Environment Variables

Make sure your `.env` file has the Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### "No active provider connection"
- Go to Settings → Providers
- Add a Vapi API key
- Set it as active

### "Failed to validate API key"
- Check that your API key is correct
- Verify it has the required permissions in Vapi dashboard
- Try testing the connection in Settings

### Database errors
- Make sure the migration was run successfully
- Check Supabase logs for specific errors
- Verify RLS policies are enabled

## Next Steps

After setup, you can:
1. Import existing Vapi assistants
2. Create new assistants
3. Configure phone numbers
4. Set up webhooks
5. Monitor usage and costs

## Support

For issues or questions:
- Check the [Vapi API Documentation](https://docs.vapi.ai)
- Review the codebase structure in `/src/services/vapi/`
- Check browser console for errors
