# Simple Session-Based Authentication (No Supabase Required)

## What Changed

I've completely removed Supabase authentication and replaced it with a simple localStorage-based session system. Now:

- **No database required** for API keys
- **No CAPTCHA issues**
- **No authentication headaches**
- Just enter your API key and it's saved in your browser

## How It Works

### First Visit
1. Visit http://localhost:8081/
2. You'll be redirected to `/start` (onboarding page)
3. Choose **Vapi** as provider
4. Choose **Import** or **Create**
5. Enter your API key: `413505b8-d790-478e-8b14-86bb93450c35`
6. Click "Connect to Vapi"
7. Your API key is saved to localStorage and you're redirected to dashboard

### Next Visits
1. Visit http://localhost:8081/
2. Your API key is loaded from localStorage
3. You're automatically redirected to `/dashboard`
4. No login required!

### To "Log Out"
Go to Provider Settings in the dashboard and remove your API key connection.

Or clear browser localStorage:
```javascript
localStorage.removeItem('voxhive_provider_connections')
```

## Technical Details

### Storage
- **Where**: Browser localStorage (key: `voxhive_provider_connections`)
- **Format**: JSON array of ProviderConnection objects
- **Persistence**: Until browser cache is cleared or you remove the connection

### Security Notes
- API keys are stored in plain text in localStorage
- This is **not recommended for production** - only for development/testing
- For production, you should use:
  - Secure backend API
  - Encrypted storage
  - Proper authentication (OAuth, JWT, etc.)
  - Supabase with proper auth flow

### Benefits for Development
- ✅ No database setup needed
- ✅ No CAPTCHA issues
- ✅ Fast iteration
- ✅ Works offline
- ✅ Simple to test
- ✅ No authentication complexity

### File Changes
- [src/contexts/ProviderContext.tsx](src/contexts/ProviderContext.tsx) - Removed all Supabase calls, now uses localStorage
- [src/pages/Landing.tsx](src/pages/Landing.tsx) - Removed error/diagnostic redirect
- No migration needed!

## Usage

Just visit http://localhost:8081/ and enter your Vapi API key. That's it!

Your API key will persist across browser sessions until you:
1. Clear browser data
2. Remove the connection via Provider Settings
3. Manually clear localStorage

## Next Steps

You can now:
1. ✅ Add your Vapi API key
2. ✅ Access the dashboard
3. ✅ Refresh the page without losing your session
4. ✅ View your Vapi assistants, calls, etc.

No database, no authentication, no hassle!
