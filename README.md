# VoxHive - Voice AI Dashboard

A comprehensive dashboard for managing Vapi voice AI agents, workflows, and integrations.

## Features

- 🤖 **Agent Management** - Create, configure, and deploy voice AI assistants
- 🔄 **Visual Workflows** - Drag-and-drop workflow builder with 8 node types
- 📚 **Knowledge Base** - Upload and manage files for AI context
- 🛠️ **Tools & Webhooks** - Integrate external services
- 📊 **Analytics** - Monitor call performance and usage
- 🎙️ **Live Testing** - Test agents with real-time transcription
- 💾 **Export/Import** - Backup and share workflows as JSON

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- ReactFlow (workflow canvas)
- Vapi API Integration
- LiveKit (voice calls)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Vapi account (get API keys from [dashboard.vapi.ai](https://dashboard.vapi.ai))

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env
```

Edit `.env` and add your API keys if needed (can also add them in the UI):
- `VAPI_PRIVATE_KEY` - Your Vapi private API key
- `VAPI_PUBLIC_KEY` - Your Vapi public API key

4. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080)

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

4. Add environment variables in Vercel dashboard (if needed)

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "Add New Project"

4. Import your GitHub repository

5. Vercel will auto-detect Vite settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. (Optional) Add environment variables:
   - Go to Settings → Environment Variables
   - Add `VAPI_PRIVATE_KEY`, `VAPI_PUBLIC_KEY`, etc.

7. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

### Option 3: Deploy via Lovable

Simply open [Lovable](https://lovable.dev/projects/5f9488d5-6a52-4222-8444-c6170587f48b) and click on Share → Publish.

## Configuration

### Vapi API Keys

You can add Vapi API keys in two ways:

1. **Environment Variables** (recommended for deployment):
   - Add in Vercel dashboard under Settings → Environment Variables
   - Keys are stored securely server-side

2. **In-App Settings** (for development):
   - Go to Settings → Providers
   - Add your private and public API keys
   - Keys are stored in localStorage

### Important Notes

- **Public Key**: Required for in-browser voice calls (safe to use client-side)
- **Private Key**: Required for API operations (assistants, workflows, etc.)
- Both keys can be found in your Vapi dashboard under Settings → API Keys

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── AgentDirectory.tsx
│   │   ├── WorkflowDirectory.tsx
│   │   ├── WorkflowCanvas.tsx
│   │   └── workflow-nodes/  # Custom workflow nodes
│   └── ui/                 # shadcn/ui components
├── services/
│   └── vapi/              # Vapi API client
├── contexts/              # React contexts
├── pages/                 # Page components
└── lib/                   # Utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Workflows

The workflow canvas allows you to create complex voice AI flows with:

- **Conversation Nodes** - AI conversation with custom prompts
- **API Request Nodes** - Call external APIs
- **Transfer Nodes** - Transfer to phone numbers or agents
- **Condition Nodes** - Branch based on logic
- **Tool Nodes** - Use custom tools
- **Extract Variables Nodes** - Capture data from conversations
- **End Call Nodes** - Terminate conversations
- **Global Nodes** - Accessible from anywhere in the flow

### Export/Import

- Export workflows as JSON for backup and version control
- Import workflows to duplicate or migrate between environments
- Share workflow templates with your team

## Support

For issues and questions:
- Vapi Documentation: [docs.vapi.ai](https://docs.vapi.ai)
- Vapi Discord: [Join community](https://discord.gg/vapi)
- Lovable Support: [docs.lovable.dev](https://docs.lovable.dev)

## License

MIT
