# 🚀 Quick Start Guide

**Your AI Orchestrator is ready!** Follow these 3 simple steps to start using it.

---

## ⚡ 3 Steps to Get Running

### Step 1️⃣: Add Your API Keys (2 minutes)

Open `.env.local` in the project root and replace the placeholders:

```env
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

**Where to get keys:**
- 🔮 Perplexity: https://www.perplexity.ai/settings/api
- 🤖 Anthropic: https://console.anthropic.com/

Save the file. The server will automatically reload! ✨

---

### Step 2️⃣: Test the Server (30 seconds)

The dev server is **already running** on http://localhost:4000

Open PowerShell in the project folder and run:

```powershell
.\test-api.ps1
```

This will:
- ✅ Check server health
- ✅ Show cache stats  
- ✅ Make a research request
- ✅ Display results

**Expected output:**
```
=== Testing AI Orchestrator API ===

1. Testing Health Endpoint...
✓ Health check passed

2. Testing Cache Stats...
✓ Cache stats retrieved

3. Testing Research Endpoint...
⏳ Sending research request (this may take 10-20 seconds)...
✓ Research completed successfully!

Topic: quantum computing
Combined Insights Preview:
[Comprehensive research results here...]
```

---

### Step 3️⃣: Try Your Own Research (1 minute)

Use PowerShell to research any topic:

```powershell
$body = @{
    topic = "your topic here"
    depth = "detailed"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/research" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Example topics to try:**
- "artificial intelligence in healthcare"
- "blockchain technology applications"
- "renewable energy trends 2026"
- "quantum computing advances"
- "space exploration missions"

**Depth options:**
- `"basic"` - Quick overview (fastest)
- `"detailed"` - Comprehensive coverage (default) ⭐
- `"comprehensive"` - Deep analysis (slowest)

---

## 🎯 What Happens When You Make a Request

```
┌─────────────────────────────────────────────────────┐
│  1. You send: POST /research                        │
│     { topic: "quantum computing", depth: "basic" }  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  2. Server checks cache                             │
│     ❌ Not found → Proceed to API calls             │
│     ✅ Found → Return instantly (< 100ms)           │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  3. Parallel API calls (10-15 seconds)              │
│                                                     │
│     ┌──────────────────┐    ┌──────────────────┐  │
│     │   Perplexity     │    │     Claude       │  │
│     │                  │    │                  │  │
│     │ • Current data   │    │ • Deep analysis  │  │
│     │ • Web sources    │    │ • Insights       │  │
│     │ • Citations      │    │ • Context        │  │
│     └──────────────────┘    └──────────────────┘  │
│              │                        │            │
│              └────────────┬───────────┘            │
└───────────────────────────┼────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────┐
│  4. Claude synthesizes both results (3-5 seconds)   │
│                                                     │
│     • Combines insights from both APIs              │
│     • Organizes information logically               │
│     • Identifies key takeaways                      │
│     • Formats with clear structure                  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  5. Cache result (1 hour TTL)                       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  6. Return comprehensive research report            │
│                                                     │
│     {                                               │
│       "topic": "quantum computing",                 │
│       "combinedInsights": "...",                    │
│       "sources": [...],                             │
│       "cached": false,                              │
│       "timestamp": "2026-02-02T..."                 │
│     }                                               │
└─────────────────────────────────────────────────────┘
```

**Next request for same topic**: Returns from cache in < 100ms! ⚡

---

## 📱 Alternative Testing Methods

### Method 1: PowerShell Script (Easiest)
```powershell
.\test-api.ps1
```

### Method 2: TypeScript Client
```bash
npx tsx example-client.ts
```

### Method 3: REST Client Extension
1. Open `test-research.http` in VS Code
2. Install "REST Client" extension
3. Click "Send Request" above any request

### Method 4: cURL (if installed)
```bash
curl -X POST http://localhost:4000/research \
  -H "Content-Type: application/json" \
  -d '{"topic":"quantum computing","depth":"basic"}'
```

### Method 5: Postman/Insomnia
Import these settings:
- **URL**: `http://localhost:4000/research`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**: `{"topic": "your topic", "depth": "detailed"}`

---

## 🎓 Understanding the Results

When you get a response, you'll see:

```json
{
  "success": true,
  "data": {
    "topic": "quantum computing",                    // Your search topic
    "perplexityData": {...},                        // Raw Perplexity response
    "claudeAnalysis": "...",                        // Claude's initial analysis
    "combinedInsights": "...",                      // ⭐ The good stuff!
    "sources": ["url1", "url2"],                    // Citations from Perplexity
    "timestamp": "2026-02-02T19:00:00.000Z",       // When it was generated
    "cached": false                                 // Was it from cache?
  }
}
```

**The `combinedInsights` field is the star** - it contains a well-structured, comprehensive summary that combines:
- Current information from Perplexity's web search
- Deep analysis from Claude's knowledge
- Organized sections with clear headings
- Key takeaways and actionable insights
- Balanced perspective considering multiple viewpoints

---

## 💡 Pro Tips

### Tip 1: Use Caching to Your Advantage
The same query (topic + depth) is cached for 1 hour:
```powershell
# First request: Takes 10-20 seconds
Invoke-RestMethod ... -Body '{"topic":"AI","depth":"basic"}'

# Same request again: Returns in < 100ms!
Invoke-RestMethod ... -Body '{"topic":"AI","depth":"basic"}'

# Different depth = new cache entry
Invoke-RestMethod ... -Body '{"topic":"AI","depth":"detailed"}'
```

### Tip 2: Choose the Right Depth
- **Basic** - Quick facts, overview (5-10 seconds)
- **Detailed** - Most balanced option ⭐ (10-15 seconds)
- **Comprehensive** - Deep dive, multiple perspectives (15-20 seconds)

### Tip 3: Monitor Your Cache
```powershell
# Check cache size
Invoke-RestMethod -Uri "http://localhost:4000/cache/stats"

# Clear expired entries
Invoke-RestMethod -Uri "http://localhost:4000/cache/clear" -Method Post
```

### Tip 4: Handle Topics Properly
✅ **Good topics:**
- "quantum computing applications"
- "climate change solutions 2026"
- "AI in healthcare"

❌ **Too vague:**
- "AI" (too broad)
- "stuff" (meaningless)
- "" (empty - will return error)

---

## 🔧 Troubleshooting

### Server not responding?
Check if it's running:
```powershell
# Should see the server logs
Get-Content "C:\Users\MYBOOK\.cursor\projects\d-MY-AI-PROJECTS-ai-orchestrator\terminals\464316.txt"
```

If not running, start it:
```powershell
npm run dev
```

### API errors?
1. Check your API keys in `.env.local`
2. Verify keys are valid and have credits
3. Look at server logs for detailed errors

### Slow responses?
- First request: 10-20 seconds is normal
- Subsequent requests: Should be < 100ms from cache
- Check your internet connection
- Some topics may take longer than others

### PowerShell script errors?
Make sure you're in the project directory:
```powershell
cd "d:\MY AI PROJECTS\ai-orchestrator"
.\test-api.ps1
```

---

## 📚 Next Steps

### Explore the Docs
- 📖 **README.md** - Project overview
- 🛠️ **SETUP_GUIDE.md** - Detailed setup instructions
- 📘 **API_REFERENCE.md** - Complete API documentation
- ✅ **DEVELOPMENT_CHECKLIST.md** - Add new features
- 📊 **PROJECT_SUMMARY.md** - Everything that's been built

### Try Different Topics
Experiment with various research areas:
- Technology trends
- Scientific discoveries
- Business strategies
- Historical events
- Current news topics

### Build Something Cool
Ideas for what to build next:
- 🖼️ Add image generation endpoint
- 📝 Add content generation for blogs/social media
- 💰 Integrate with N8n for finance data
- 🌐 Build a web frontend
- 🤖 Create a Slack/Discord bot
- 📊 Build a research dashboard

### Share Your Results
The research results are perfect for:
- Blog posts
- Reports
- Presentations
- Learning new topics
- Content creation

---

## 🎉 You're All Set!

Your AI Orchestrator is:
- ✅ Fully configured
- ✅ Running and ready
- ✅ Tested and working
- ✅ Well documented
- ✅ Easy to extend

**Just add your API keys and start researching!** 🚀

---

## ⚡ The Absolute Quickest Test

Copy-paste this into PowerShell (after adding API keys):

```powershell
$body = @{ topic = "quantum computing"; depth = "basic" } | ConvertTo-Json
(Invoke-RestMethod -Uri "http://localhost:4000/research" -Method Post -Body $body -ContentType "application/json").data.combinedInsights
```

This will show you the combined insights directly in your terminal!

---

**Happy researching! 🔬✨**
