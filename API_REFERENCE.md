# AI Orchestrator - API Reference

Base URL: `http://localhost:4000`

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-02T19:00:00.000Z",
  "service": "ai-orchestrator"
}
```

---

### 2. Conduct Research
**POST** `/research`

Perform intelligent research combining Perplexity and Claude.

**Request Body:**
```json
{
  "topic": "string (required)",
  "depth": "basic | detailed | comprehensive (optional, default: detailed)"
}
```

**Example Request:**
```json
{
  "topic": "quantum computing applications",
  "depth": "detailed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "quantum computing applications",
    "perplexityData": { /* Raw Perplexity response */ },
    "claudeAnalysis": "string (Claude's initial analysis)",
    "combinedInsights": "string (synthesized insights from both sources)",
    "sources": ["url1", "url2", ...],
    "timestamp": "2026-02-02T19:00:00.000Z",
    "cached": false
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (missing or invalid topic)
- `500` - Server error (API failure, network issues, etc.)

**Performance:**
- First request: 10-20 seconds
- Cached request: < 100ms
- Cache duration: 1 hour

---

### 3. Get Cache Statistics
**GET** `/cache/stats`

Get information about the current cache state.

**Response:**
```json
{
  "success": true,
  "data": {
    "size": 5,
    "ttl": 3600000
  }
}
```

- `size`: Number of cached entries
- `ttl`: Time-to-live in milliseconds (3600000 = 1 hour)

---

### 4. Clear Expired Cache
**POST** `/cache/clear`

Remove expired entries from the cache.

**Response:**
```json
{
  "success": true,
  "message": "Expired cache entries cleared"
}
```

**Note:** This only removes expired entries. Active entries remain cached.

---

## Research Depth Levels

### Basic
- Quick overview
- Key facts only
- Concise analysis
- Fastest response

### Detailed (Default)
- Comprehensive coverage
- Multiple perspectives
- Examples and context
- Balanced analysis

### Comprehensive
- Deep, thorough analysis
- Historical context
- Future implications
- Multiple viewpoints
- Detailed exploration

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error category",
  "message": "Detailed error message"
}
```

**Common Errors:**

**400 Bad Request**
```json
{
  "error": "Invalid request",
  "message": "Topic is required and must be a non-empty string"
}
```

**404 Not Found**
```json
{
  "error": "Not found",
  "message": "Cannot GET /invalid-path"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "Failed to conduct research on topic: quantum computing"
}
```

---

## Rate Limiting & Best Practices

### Caching Strategy
- Identical queries (same topic + depth) return cached results
- Cache key: `{topic}_{depth}` (case-insensitive)
- Cache duration: 1 hour
- Cache is in-memory (clears on server restart)

### Best Practices
1. Use appropriate depth level for your use case
2. Reuse cached results when possible
3. Handle errors gracefully
4. Set reasonable timeouts (20-30 seconds for first request)
5. Monitor cache stats to understand hit rates

### API Key Management
- Store keys in `.env.local` (never commit to git)
- Rotate keys periodically
- Monitor API usage on provider dashboards
- Handle API errors gracefully (rate limits, quota exceeded)

---

## Code Examples

### JavaScript/TypeScript (fetch)
```typescript
const response = await fetch('http://localhost:4000/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'artificial intelligence in healthcare',
    depth: 'detailed'
  })
});

const data = await response.json();
console.log(data.data.combinedInsights);
```

### PowerShell
```powershell
$body = @{
    topic = "artificial intelligence in healthcare"
    depth = "detailed"
} | ConvertTo-Json

$result = Invoke-RestMethod `
    -Uri "http://localhost:4000/research" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

Write-Host $result.data.combinedInsights
```

### cURL
```bash
curl -X POST http://localhost:4000/research \
  -H "Content-Type: application/json" \
  -d '{"topic":"artificial intelligence in healthcare","depth":"detailed"}'
```

### Python (requests)
```python
import requests

response = requests.post(
    'http://localhost:4000/research',
    json={
        'topic': 'artificial intelligence in healthcare',
        'depth': 'detailed'
    }
)

data = response.json()
print(data['data']['combinedInsights'])
```

---

## Other Current Endpoints (Summary)

- **POST** `/chat/grok` – Grok chat (body: `messages`, `model?`, `max_tokens?`, `temperature?`)
- **POST** `/gamma/create` – Gamma presentation/document (body: `inputText`, `format?`, etc.)
- **GET** `/gamma/status/:generationId` – Gamma job status
- **POST** `/image/generate` – Krea image generation (body: `prompt`, `width?`, `height?`, etc.)
- **GET** `/image/job/:jobId` – Krea job status
- **GET** `/stock/search?term=...&page=&limit=&order=` – Freepik stock search
- **GET** `/stock/resource/:id` – Freepik resource by ID
- **GET** `/auth/canva/authorize` – Canva OAuth (one-time; redirects to Canva, then callback shows tokens)
- **GET** `/auth/canva/callback` – Canva OAuth callback (shows CANVA_ACCESS_TOKEN, CANVA_REFRESH_TOKEN)
- **POST** `/canva/create-proposal` – Create design from brand template (body: `templateId`, `title?`, `content`)
- **GET** `/canva/autofill-job/:jobId` – Canva autofill job status
- **POST** `/canva/auth-url`, **GET** `/canva/callback`, **POST** `/canva/token`, **POST** `/canva/refresh` – Canva OAuth (PKCE)

**Environment:** `GOOGLE_API_KEY` is in `.env.local` for future Google APIs (Maps, YouTube, Gemini, etc.).

## Future Endpoints

- **POST** `/content/generate` – Content generation
- **POST** `/finance/analyze` – Finance analysis via N8n
- **POST** `/video/analyze` – Video content analysis
- **POST** `/document/process` – Document processing

---

## Support & Documentation

- **Setup Guide**: See `SETUP_GUIDE.md`
- **Project README**: See `README.md`
- **Example Code**: See `example-client.ts`
- **Test Requests**: See `test-research.http`
