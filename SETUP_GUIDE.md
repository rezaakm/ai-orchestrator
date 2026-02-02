# AI Orchestrator - Setup & Testing Guide

## ✅ What's Been Completed

Your AI Orchestrator project is now fully set up with the following:

### Project Structure
```
ai-orchestrator/
├── src/
│   ├── clients/
│   │   ├── anthropic.client.ts    ✓ Claude API wrapper
│   │   └── perplexity.client.ts   ✓ Perplexity API wrapper
│   ├── services/
│   │   └── research.service.ts    ✓ Research orchestration with caching
│   ├── types/
│   │   └── index.ts               ✓ TypeScript type definitions
│   └── index.ts                   ✓ Express server with endpoints
├── .env.local                      ✓ Environment variables template
├── .gitignore                      ✓ Git ignore configuration
├── package.json                    ✓ Dependencies and scripts
├── tsconfig.json                   ✓ TypeScript configuration
├── README.md                       ✓ Project documentation
├── test-api.ps1                   ✓ PowerShell test script
├── test-research.http             ✓ HTTP request examples
└── example-client.ts              ✓ Example client code
```

### Features Implemented
- ✅ Parallel API calls (Perplexity + Claude)
- ✅ Intelligent result caching (1-hour TTL)
- ✅ Three research depth levels (basic, detailed, comprehensive)
- ✅ RESTful API with Express
- ✅ Full TypeScript support with ES modules
- ✅ Hot reload for development
- ✅ Error handling and validation
- ✅ Health check and cache management endpoints

### Server Status
🟢 **Server is currently running** on http://localhost:4000

## 🔑 Next Step: Add Your API Keys

1. Open the `.env.local` file in the project root
2. Replace the placeholder values with your actual API keys:

```env
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

3. Save the file. The server will automatically reload with the new keys.

### Where to Get API Keys

**Perplexity API**
- Visit: https://www.perplexity.ai/settings/api
- Sign up or log in
- Generate an API key

**Anthropic Claude API**
- Visit: https://console.anthropic.com/
- Sign up or log in
- Go to API Keys section
- Generate a new key

## 🧪 Testing the API

### Option 1: PowerShell Test Script (Recommended)
```powershell
.\test-api.ps1
```
This will test all endpoints including a basic research query.

### Option 2: Manual HTTP Requests

**Test Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/health"
```

**Test Research Endpoint:**
```powershell
$body = @{
    topic = "quantum computing"
    depth = "basic"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/research" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Option 3: Use the Example Client
```bash
npx tsx example-client.ts
```

### Option 4: REST Client Extension
If you have the REST Client extension in VS Code:
1. Open `test-research.http`
2. Click "Send Request" above any request

## 📊 Understanding the Research Flow

1. **Request arrives** → POST /research with topic
2. **Cache check** → If result exists and fresh, return immediately
3. **Parallel calls** → Simultaneously query:
   - Perplexity (for current web data + sources)
   - Claude (for analysis and insights)
4. **Synthesis** → Claude combines both results intelligently
5. **Cache & return** → Store result for 1 hour, send to client

### Research Depth Levels

- **basic**: Quick overview, concise analysis (fastest)
- **detailed**: Comprehensive coverage with examples (default)
- **comprehensive**: Deep dive with multiple perspectives (slowest)

## 🎯 Expected Response Time

- **First request**: 10-20 seconds (parallel API calls + synthesis)
- **Cached request**: < 100ms (instant from cache)
- **Cache TTL**: 1 hour

## 🔍 Monitoring & Debugging

### View Server Logs
The development server shows all requests and responses in the terminal.

### Check Cache Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/cache/stats"
```

### Clear Expired Cache
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/cache/clear" -Method Post
```

## 🚀 Development Commands

```bash
# Start development server (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 🎯 Next Features to Add

Now that the research service is working, you can add:

1. **Image Generation Endpoint** - Integrate DALL-E or Stable Diffusion
2. **Content Generation Endpoint** - Expand Claude capabilities
3. **Finance Endpoints** - Connect to N8n webhooks
4. **Video Analysis** - Process video content
5. **Document Processing** - Handle PDFs and documents

Each feature should be added incrementally and tested before moving to the next.

## 🐛 Troubleshooting

### Server won't start
- Check if port 4000 is already in use
- Verify Node.js version (18+)
- Run `npm install` again

### API requests fail
- Verify API keys are correct in `.env.local`
- Check if keys have sufficient credits
- Look at server logs for detailed error messages

### Cache not working
- Cache is in-memory, clears when server restarts
- Check cache stats endpoint to verify

## 📝 Making Changes

The project uses `tsx watch` which automatically reloads when you save files. Just edit and save - no need to restart the server.

### Key Files to Modify

- `src/index.ts` - Add new endpoints
- `src/services/` - Add new service logic
- `src/clients/` - Add new API integrations
- `src/types/` - Add TypeScript types

## 🎉 You're All Set!

Once you add your API keys, run the test script to see the orchestrator in action:

```powershell
.\test-api.ps1
```

The research service will demonstrate the power of combining multiple AI APIs in parallel with intelligent caching!
