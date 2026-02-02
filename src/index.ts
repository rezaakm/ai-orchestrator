import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ResearchService } from './services/research.service.js';
import { CanvaClient } from './clients/canva.client.js';
import { KreaClient } from './clients/krea.client.js';
import { GrokClient } from './clients/grok.client.js';
import { FreepikClient } from './clients/freepik.client.js';
import { GammaClient } from './clients/gamma.client.js';
import type { ResearchRequest, CanvaAuthUrlRequest, CanvaExchangeTokenRequest, CanvaRefreshTokenRequest, KreaImageGenerateRequest, GrokChatRequest, FreepikSearchRequest, GammaCreateRequest, CanvaCreateProposalRequest } from './types/index.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const researchService = new ResearchService();
const canvaClient = new CanvaClient();
const kreaClient = new KreaClient();
const grokClient = new GrokClient();
const freepikClient = new FreepikClient();
const gammaClient = new GammaClient();

// In-memory store for Canva OAuth PKCE code_verifier by state (for callback flow)
const canvaStateStore = new Map<string, { codeVerifier: string; redirectUri?: string }>();

// Root: simple welcome page with links
app.get('/', (req: Request, res: Response) => {
  res.type('html').send(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>AI Orchestrator</title></head>
<body style="font-family:sans-serif;max-width:640px;margin:3rem auto;padding:1.5rem;">
  <h1>AI Orchestrator</h1>
  <p>Server is running. Useful links:</p>
  <ul>
    <li><a href="/health">Health check</a> – status and Canva config</li>
    <li><a href="/auth/canva/authorize">Canva OAuth</a> – get access/refresh tokens (one-time)</li>
  </ul>
  <p>API docs: see <code>API_REFERENCE.md</code> in the project.</p>
</body></html>
  `);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ai-orchestrator',
    canva: {
      configured: canvaClient.isConfigured(),
      hasDesignTokens: canvaClient.hasDesignTokens(),
    },
  });
});

// Research endpoint
app.post('/research', async (req: Request, res: Response) => {
  try {
    const { topic, depth = 'detailed' }: ResearchRequest = req.body;

    // Validate request
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Topic is required and must be a non-empty string' 
      });
      return;
    }

    console.log(`Research request received: ${topic} (depth: ${depth})`);

    // Conduct research
    const result = await researchService.conductResearch({ topic, depth });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Research endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

// Cache stats endpoint
app.get('/cache/stats', (req: Request, res: Response) => {
  const stats = researchService.getCacheStats();
  res.json({
    success: true,
    data: stats,
  });
});

// Clear expired cache endpoint
app.post('/cache/clear', (req: Request, res: Response) => {
  researchService.clearExpiredCache();
  res.json({
    success: true,
    message: 'Expired cache entries cleared',
  });
});

// --- Grok chat ---
app.post('/chat/grok', async (req: Request, res: Response) => {
  try {
    if (!grokClient.isConfigured()) {
      res.status(503).json({ error: 'Grok not configured', message: 'Set GROK_API_KEY in .env.local' });
      return;
    }
    const { messages, model, max_tokens, temperature }: GrokChatRequest = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Invalid request', message: 'messages array is required' });
      return;
    }
    const content = await grokClient.chat({
      messages,
      model: model ?? 'grok-4-latest',
      max_tokens: max_tokens ?? 4096,
      temperature: temperature ?? 0,
      stream: false,
    });
    res.json({ success: true, data: { content } });
  } catch (error) {
    console.error('Grok chat error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// --- Gamma.app generations ---
app.post('/gamma/create', async (req: Request, res: Response) => {
  try {
    if (!gammaClient.isConfigured()) {
      res.status(503).json({ error: 'Gamma not configured', message: 'Set GAMMA_API_KEY in .env.local' });
      return;
    }
    const body: GammaCreateRequest = req.body;
    if (!body.inputText || typeof body.inputText !== 'string' || body.inputText.trim().length === 0) {
      res.status(400).json({ error: 'Invalid request', message: 'inputText is required' });
      return;
    }
    const result = await gammaClient.createGeneration(body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Gamma create error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/gamma/status/:generationId', async (req: Request, res: Response) => {
  try {
    const generationId = Array.isArray(req.params.generationId) ? req.params.generationId[0] : req.params.generationId;
    if (!generationId) {
      res.status(400).json({ error: 'Invalid request', message: 'generationId is required' });
      return;
    }
    const status = await gammaClient.getGenerationStatus(generationId);
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Gamma status error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// --- Freepik stock content ---
app.get('/stock/search', async (req: Request, res: Response) => {
  try {
    if (!freepikClient.isConfigured()) {
      res.status(503).json({ error: 'Freepik not configured', message: 'Set FREEPIK_API_KEY in .env.local' });
      return;
    }
    const term = (req.query.term as string) || '';
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const order = (req.query.order as 'relevance' | 'recent') || 'relevance';
    const result = await freepikClient.searchResources({ term, page, limit, order });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Freepik search error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/stock/resource/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ error: 'Invalid request', message: 'Resource id is required' });
      return;
    }
    const resource = await freepikClient.getResource(id);
    res.json({ success: true, data: resource });
  } catch (error) {
    console.error('Freepik get resource error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// --- Krea image generation ---
app.post('/image/generate', async (req: Request, res: Response) => {
  try {
    if (!kreaClient.isConfigured()) {
      res.status(503).json({ error: 'Krea not configured', message: 'Set KREA_API_KEY in .env.local' });
      return;
    }
    const { prompt, width, height, strength, seed, steps, webhookUrl }: KreaImageGenerateRequest = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'Invalid request', message: 'prompt is required' });
      return;
    }
    const job = await kreaClient.generateImage(
      { prompt: prompt.trim(), width, height, strength, seed, steps },
      webhookUrl
    );
    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Krea image generate error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/image/job/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    if (!jobId) {
      res.status(400).json({ error: 'Invalid request', message: 'jobId is required' });
      return;
    }
    const job = await kreaClient.getJob(jobId);
    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Krea get job error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// --- Canva OAuth (one-click flow for getting tokens) ---

// Canva requires 127.0.0.1 in redirect URIs (localhost is not accepted in Developer Portal).
const AUTH_CANVA_REDIRECT_URI = `http://127.0.0.1:${PORT}/auth/canva/callback`;
const AUTH_CANVA_SCOPES = ['design:content:write', 'design:content:read', 'design:meta:read', 'brandtemplate:meta:read', 'brandtemplate:content:read'];

// Visit in browser to start OAuth; redirects to Canva, then back to callback which shows tokens to copy.
app.get('/auth/canva/authorize', (req: Request, res: Response) => {
  try {
    if (!canvaClient.isConfigured()) {
      res.status(503).send('Canva not configured. Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in .env.local');
      return;
    }
    const result = canvaClient.createAuthorizationUrl(AUTH_CANVA_REDIRECT_URI, AUTH_CANVA_SCOPES);
    canvaStateStore.set(result.state, { codeVerifier: result.codeVerifier, redirectUri: AUTH_CANVA_REDIRECT_URI });
    res.redirect(result.url);
  } catch (error) {
    console.error('Canva auth authorize error:', error);
    res.status(500).send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Callback from Canva after user authorizes; displays tokens as HTML for copy to .env.local.
app.get('/auth/canva/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
      res.status(400).send('Missing code or state. Start again at /auth/canva/authorize');
      return;
    }
    const stored = canvaStateStore.get(state);
    if (!stored) {
      res.status(400).send('Invalid or expired state. Visit /auth/canva/authorize again.');
      return;
    }
    canvaStateStore.delete(state);
    const tokens = await canvaClient.exchangeCodeForToken(code, stored.codeVerifier, stored.redirectUri);
    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Canva tokens</title></head>
      <body style="font-family:sans-serif;max-width:720px;margin:2rem auto;padding:1rem;">
        <h1>Canva authorization successful</h1>
        <p>Copy these lines into your <code>.env.local</code> file (replace any existing values):</p>
        <pre style="background:#f5f5f5;padding:1rem;overflow:auto;border-radius:6px;">CANVA_ACCESS_TOKEN=${tokens.access_token}
CANVA_REFRESH_TOKEN=${tokens.refresh_token}</pre>
        <p><strong>Access token expires in ${tokens.expires_in} seconds.</strong> Use the refresh token to get new access tokens. Restart the orchestrator after updating .env.local.</p>
      </body></html>
    `;
    res.type('html').send(html);
  } catch (error) {
    console.error('Canva auth callback error:', error);
    res.status(500).send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// --- Canva OAuth ---

// Get Canva authorization URL (PKCE). Store codeVerifier by state; redirect user to url.
app.post('/canva/auth-url', (req: Request, res: Response) => {
  try {
    if (!canvaClient.isConfigured()) {
      res.status(503).json({ error: 'Canva not configured', message: 'Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in .env.local' });
      return;
    }
    const { redirectUri, scopes }: CanvaAuthUrlRequest = req.body;
    if (!redirectUri || typeof redirectUri !== 'string' || redirectUri.trim().length === 0) {
      res.status(400).json({ error: 'Invalid request', message: 'redirectUri is required' });
      return;
    }
    const result = canvaClient.createAuthorizationUrl(redirectUri.trim(), scopes);
    canvaStateStore.set(result.state, { codeVerifier: result.codeVerifier, redirectUri: redirectUri.trim() });
    res.json({ success: true, data: { url: result.url, state: result.state, codeVerifier: result.codeVerifier } });
  } catch (error) {
    console.error('Canva auth-url error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// OAuth callback: GET /canva/callback?code=...&state=... (use this as redirect_uri to have server exchange the code)
app.get('/canva/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
      res.status(400).json({ error: 'Invalid request', message: 'code and state query parameters are required' });
      return;
    }
    const stored = canvaStateStore.get(state);
    if (!stored) {
      res.status(400).json({ error: 'Invalid state', message: 'State not found or expired. Start the auth flow again.' });
      return;
    }
    canvaStateStore.delete(state);
    const tokens = await canvaClient.exchangeCodeForToken(code, stored.codeVerifier, stored.redirectUri);
    res.json({ success: true, data: tokens });
  } catch (error) {
    console.error('Canva callback error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Exchange authorization code for tokens (when client holds codeVerifier)
app.post('/canva/token', async (req: Request, res: Response) => {
  try {
    if (!canvaClient.isConfigured()) {
      res.status(503).json({ error: 'Canva not configured', message: 'Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in .env.local' });
      return;
    }
    const { code, codeVerifier, redirectUri }: CanvaExchangeTokenRequest = req.body;
    if (!code || !codeVerifier) {
      res.status(400).json({ error: 'Invalid request', message: 'code and codeVerifier are required' });
      return;
    }
    const tokens = await canvaClient.exchangeCodeForToken(code, codeVerifier, redirectUri);
    res.json({ success: true, data: tokens });
  } catch (error) {
    console.error('Canva token exchange error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Refresh access token
app.post('/canva/refresh', async (req: Request, res: Response) => {
  try {
    if (!canvaClient.isConfigured()) {
      res.status(503).json({ error: 'Canva not configured', message: 'Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in .env.local' });
      return;
    }
    const { refreshToken }: CanvaRefreshTokenRequest = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Invalid request', message: 'refreshToken is required' });
      return;
    }
    const tokens = await canvaClient.refreshAccessToken(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error) {
    console.error('Canva refresh error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Create proposal from Canva brand template (autofill). Requires OAuth tokens; run /auth/canva/authorize once.
app.post('/canva/create-proposal', async (req: Request, res: Response) => {
  try {
    if (!canvaClient.isConfigured()) {
      res.status(503).json({ error: 'Canva not configured', message: 'Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in .env.local' });
      return;
    }
    if (!canvaClient.hasDesignTokens()) {
      res.status(503).json({ error: 'Canva tokens required', message: 'Visit http://127.0.0.1:4000/auth/canva/authorize once and add CANVA_ACCESS_TOKEN and CANVA_REFRESH_TOKEN to .env.local' });
      return;
    }
    const { templateId, title, content }: CanvaCreateProposalRequest = req.body;
    if (!templateId || typeof templateId !== 'string' || templateId.trim().length === 0) {
      res.status(400).json({ error: 'Invalid request', message: 'templateId is required' });
      return;
    }
    if (!content || typeof content !== 'object' || Object.keys(content).length === 0) {
      res.status(400).json({ error: 'Invalid request', message: 'content object with autofill field values is required' });
      return;
    }
    const autofillData = canvaClient.formatAutofillData(content as Record<string, string | { type: 'image'; url?: string; asset_id?: string }>);
    if (Object.keys(autofillData).length === 0) {
      res.status(400).json({ error: 'Invalid request', message: 'content must have at least one text field or image field with asset_id' });
      return;
    }
    const { jobId } = await canvaClient.createAutofillJob(templateId, autofillData, title);
    const maxAttempts = 60;
    const pollIntervalMs = 2000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, pollIntervalMs));
      const job = await canvaClient.getAutofillJob(jobId);
      if (job.status === 'success' && job.result?.design?.urls) {
        res.json({
          success: true,
          data: {
            designId: job.result.design.id,
            editUrl: job.result.design.urls.edit_url,
            viewUrl: job.result.design.urls.view_url,
            title: job.result.design.title,
            url: job.result.design.url,
          },
        });
        return;
      }
      if (job.status === 'failed') {
        res.status(500).json({
          error: 'Autofill failed',
          message: job.error?.message ?? 'Canva autofill job failed',
        });
        return;
      }
    }
    res.status(504).json({ error: 'Timeout', message: 'Autofill job did not complete in time' });
  } catch (error) {
    console.error('Canva create-proposal error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get autofill job status (for polling without blocking).
app.get('/canva/autofill-job/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    if (!jobId) {
      res.status(400).json({ error: 'Invalid request', message: 'jobId is required' });
      return;
    }
    const job = await canvaClient.getAutofillJob(jobId);
    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Canva get autofill job error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not found', 
    message: `Cannot ${req.method} ${req.path}` 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Orchestrator running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Research endpoint: POST http://localhost:${PORT}/research`);
  console.log(`💾 Cache stats: GET http://localhost:${PORT}/cache/stats`);
  console.log(`🤖 Grok chat: POST http://localhost:${PORT}/chat/grok`);
  console.log(`🖼️ Image (Krea): POST http://localhost:${PORT}/image/generate, GET /image/job/:jobId`);
  console.log(`📷 Freepik stock: GET http://localhost:${PORT}/stock/search?term=..., GET /stock/resource/:id`);
  console.log(`📑 Gamma: POST http://localhost:${PORT}/gamma/create, GET /gamma/status/:generationId`);
  console.log(`🎨 Canva: GET http://127.0.0.1:${PORT}/auth/canva/authorize (one-time OAuth), POST /canva/create-proposal, GET /canva/autofill-job/:jobId`);
});
