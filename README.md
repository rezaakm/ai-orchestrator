# AI Orchestrator

A powerful AI orchestration service that combines multiple AI APIs (Perplexity, Claude) to provide intelligent research, content generation, and workflow automation.

## Features

- **Parallel API Calls**: Calls Perplexity and Claude simultaneously for faster results
- **Intelligent Caching**: Caches research results for 1 hour to save API calls and costs
- **Research Synthesis**: Combines insights from multiple AI sources into coherent summaries
- **Depth Control**: Choose between basic, detailed, or comprehensive research
- **RESTful API**: Easy-to-use HTTP endpoints
- **TypeScript**: Full type safety and modern ES modules

## Prerequisites

- Node.js 18+ 
- npm or yarn
- API Keys:
  - Perplexity API key
  - Anthropic API key

## Installation

1. Clone or navigate to the project directory
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```env
PERPLEXITY_API_KEY=your_perplexity_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
PORT=4000
NODE_ENV=development
```

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Research
Conduct intelligent research on any topic.

```
POST /research
Content-Type: application/json

{
  "topic": "artificial intelligence in healthcare",
  "depth": "detailed"
}
```

**Parameters:**
- `topic` (required): The research topic
- `depth` (optional): "basic" | "detailed" | "comprehensive" (default: "detailed")

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "artificial intelligence in healthcare",
    "perplexityData": {...},
    "claudeAnalysis": "...",
    "combinedInsights": "...",
    "sources": [...],
    "timestamp": "2026-02-02T...",
    "cached": false
  }
}
```

### Cache Stats
```
GET /cache/stats
```

### Clear Expired Cache
```
POST /cache/clear
```

## Project Structure

```
ai-orchestrator/
├── src/
│   ├── clients/          # API client wrappers
│   │   ├── perplexity.client.ts
│   │   └── anthropic.client.ts
│   ├── services/         # Business logic
│   │   └── research.service.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts         # Express server entry point
├── dist/                # Compiled JavaScript (generated)
├── .env.local          # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

Test the research endpoint using curl:

```bash
curl -X POST http://localhost:4000/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "quantum computing", "depth": "detailed"}'
```

Or use a tool like Postman, Insomnia, or Thunder Client.

## Architecture

The orchestrator uses a service-oriented architecture:

1. **Clients Layer**: Wraps external API calls (Perplexity, Anthropic)
2. **Services Layer**: Contains business logic for orchestration and caching
3. **API Layer**: Express endpoints that expose functionality

### How Research Works

1. Client sends POST request with topic
2. Service checks cache for existing results
3. If not cached, makes parallel calls to:
   - Perplexity (for current web data and sources)
   - Claude (for analysis and insights)
4. Combines results using Claude's synthesis capabilities
5. Caches the result for 1 hour
6. Returns comprehensive research report

## Next Steps

This project is currently set up with the research endpoint. Next endpoints to add:

- Image generation
- Content generation
- Finance endpoints (N8n integration)
- Video analysis
- Document processing

## License

ISC
