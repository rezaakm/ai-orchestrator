# Transfer to Cursor Web - Setup Guide

## Step 1: Push to GitHub

This project is now initialized as a git repository. Push it to GitHub:

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-orchestrator.git
git branch -M main
git add .
git commit -m "Initial AI orchestrator with all integrations"
git push -u origin main
```

## Step 2: Clone in Cursor Web

1. Open Cursor Web
2. Clone your repository
3. Open the `ai-orchestrator` folder

## Step 3: Restore Your API Keys

**IMPORTANT:** `.env.local` is not in git (it's in `.gitignore` for security).

Copy your API keys from the old `.env.local` to Cursor Web:

### Method 1: Copy from this file
Your current `.env.local` contains:

```env
# Copy your actual keys from the local .env.local file
# DO NOT commit actual keys to git - this is just a reference
PERPLEXITY_API_KEY=your_perplexity_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GROK_API_KEY=your_grok_key_here
GOOGLE_API_KEY=your_google_key_here
PORT=4000
NODE_ENV=development
CANVA_CLIENT_ID=your_canva_client_id_here
CANVA_CLIENT_SECRET=your_canva_client_secret_here
CANVA_ACCESS_TOKEN=
CANVA_REFRESH_TOKEN=
KREA_API_KEY=your_krea_key_here
FREEPIK_API_KEY=your_freepik_key_here
GAMMA_API_KEY=your_gamma_key_here
N8N_WEBHOOK_URL=your_n8n_webhook_url_here
```

**Note:** Use the `backup-env.ps1` script to copy your actual keys to clipboard, then paste into `.env.local` in Cursor Web.

### Method 2: Use .env.example as template
In Cursor Web:

1. Copy `.env.example` to `.env.local`
2. Fill in your actual API keys from above

## Step 4: Install Dependencies

In Cursor Web terminal:

```bash
npm install
```

## Step 5: Run the Orchestrator

```bash
npm run dev
```

The server should start on port 4000 (or whatever `PORT` you set).

## Step 6: Complete Canva OAuth (if needed)

If you haven't gotten `CANVA_ACCESS_TOKEN` and `CANVA_REFRESH_TOKEN` yet:

1. Make sure redirect URI `http://127.0.0.1:4000/auth/canva/callback` is in Canva Developer Portal
2. Open: `http://127.0.0.1:4000/auth/canva/authorize`
3. Authorize in Canva
4. Copy the tokens from the callback page into `.env.local`
5. Restart: `npm run dev`

## Networking Notes

- **Cursor Web** may use different networking (e.g. cloud environment vs localhost).
- **Port 4000** should work, but if there's a conflict, change `PORT` in `.env.local`.
- **OAuth callback** redirect URIs might need adjustment if Cursor Web uses a different host (e.g. a cloud URL instead of 127.0.0.1). Check Cursor Web docs for how localhost works.

## Testing

```bash
# Health check
curl http://localhost:4000/health

# Research
curl -X POST http://localhost:4000/research \
  -H "Content-Type: application/json" \
  -d '{"topic":"quantum computing","depth":"basic"}'
```

---

## Security Reminder

**Never commit `.env.local`** to git. It's in `.gitignore` to protect your API keys. Always transfer it manually or use a secure secrets manager.
