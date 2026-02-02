import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';
const CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
const CANVA_API_BASE = 'https://api.canva.com/rest/v1';

export interface CanvaTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface CanvaAuthUrlResult {
  url: string;
  state: string;
  codeVerifier: string;
}

export class CanvaClient {
  private clientId: string;
  private clientSecret: string;
  private credentials: string; // Base64(clientId:clientSecret)

  constructor() {
    this.clientId = process.env.CANVA_CLIENT_ID || '';
    this.clientSecret = process.env.CANVA_CLIENT_SECRET || '';
    const raw = `${this.clientId}:${this.clientSecret}`;
    this.credentials = Buffer.from(raw, 'utf-8').toString('base64');

    if (!this.clientId || !this.clientSecret) {
      console.warn('Warning: CANVA_CLIENT_ID or CANVA_CLIENT_SECRET not set');
    }
  }

  /**
   * Generate PKCE code_verifier and code_challenge (SHA-256 base64url).
   */
  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(96).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  /**
   * Generate a random state string for CSRF protection.
   */
  private generateState(): string {
    return crypto.randomBytes(96).toString('base64url');
  }

  /**
   * Build the Canva OAuth authorization URL (PKCE flow).
   * Store codeVerifier server-side keyed by state; use it when exchanging the code.
   */
  createAuthorizationUrl(
    redirectUri: string,
    scopes: string[] = ['asset:read', 'design:meta:read', 'design:permission:read', 'folder:read']
  ): CanvaAuthUrlResult {
    const { codeVerifier, codeChallenge } = this.generatePKCE();
    const state = this.generateState();

    const params = new URLSearchParams({
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: scopes.join(' '),
      response_type: 'code',
      client_id: this.clientId,
      state,
      redirect_uri: redirectUri,
    });

    const url = `${CANVA_AUTH_URL}?${params.toString()}`;
    return { url, state, codeVerifier };
  }

  /**
   * Exchange authorization code for access_token and refresh_token.
   */
  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri?: string
  ): Promise<CanvaTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
      code,
      ...(redirectUri && { redirect_uri: redirectUri }),
    });

    const response = await fetch(CANVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Canva token exchange failed: ${response.status} ${(err as { message?: string }).message || response.statusText}`
      );
    }

    return (await response.json()) as CanvaTokenResponse;
  }

  /**
   * Refresh an access token using a refresh_token.
   */
  async refreshAccessToken(refreshToken: string): Promise<CanvaTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(CANVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Canva token refresh failed: ${response.status} ${(err as { message?: string }).message || response.statusText}`
      );
    }

    return (await response.json()) as CanvaTokenResponse;
  }

  /**
   * Make an authenticated request to the Canva Connect API.
   */
  async request<T = unknown>(
    accessToken: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = path.startsWith('http') ? path : `${CANVA_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    let fetchBody: string | undefined;
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method,
      headers,
      ...(fetchBody && { body: fetchBody }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Canva API error: ${response.status} ${(err as { message?: string }).message || response.statusText}`
      );
    }

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  /**
   * Check if client is configured (has credentials).
   */
  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  // --- Design creation (requires CANVA_ACCESS_TOKEN and CANVA_REFRESH_TOKEN from OAuth) ---

  private accessToken = process.env.CANVA_ACCESS_TOKEN || '';
  private refreshToken = process.env.CANVA_REFRESH_TOKEN || '';

  /**
   * Get a valid access token, refreshing if necessary (uses in-memory token after refresh).
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;
    if (!this.refreshToken) throw new Error('Canva tokens not configured. Run OAuth flow: visit http://127.0.0.1:4000/auth/canva/authorize');
    const tokens = await this.refreshAccessToken(this.refreshToken);
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    return this.accessToken;
  }

  /**
   * Ensure we have a valid token; on 401 refresh and retry the request.
   */
  private async requestWithAuth<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    retried = false
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = path.startsWith('http') ? path : `${CANVA_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });

    if (response.status === 401 && !retried) {
      this.accessToken = '';
      const tokens = await this.refreshAccessToken(this.refreshToken);
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      return this.requestWithAuth(method, path, body, true);
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Canva API error: ${response.status} ${(err as { message?: string }).message || response.statusText}`
      );
    }

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  /** Autofill field: text or image (image uses asset_id from Canva Assets API). */
  formatAutofillData(data: Record<string, string | { type: 'image'; url?: string; asset_id?: string }>): Record<string, { type: 'text'; text: string } | { type: 'image'; asset_id: string }> {
    const out: Record<string, { type: 'text'; text: string } | { type: 'image'; asset_id: string }> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        out[key] = { type: 'text', text: value };
      } else if (value && value.type === 'image') {
        if (value.asset_id) {
          out[key] = { type: 'image', asset_id: value.asset_id };
        }
        // If only url is provided, image would need to be uploaded first to get asset_id; skip or document
      }
    }
    return out;
  }

  /** Create an autofill job (async). Poll getAutofillJob(jobId) until status is success or failed. */
  async createAutofillJob(
    brandTemplateId: string,
    data: Record<string, { type: 'text'; text: string } | { type: 'image'; asset_id: string }>,
    title?: string
  ): Promise<{ jobId: string; status: string }> {
    const body = { brand_template_id: brandTemplateId, data, ...(title && title.trim() && { title: title.trim() }) };
    const result = (await this.requestWithAuth<{ job: { id: string; status: string } }>('POST', '/autofills', body)) as { job: { id: string; status: string } };
    return { jobId: result.job.id, status: result.job.status };
  }

  /** Get autofill job status and result (design with edit_url, view_url when status === 'success'). */
  async getAutofillJob(jobId: string): Promise<{
    id: string;
    status: 'in_progress' | 'success' | 'failed';
    result?: { type: string; design?: { id: string; title?: string; url?: string; urls?: { edit_url: string; view_url: string } } };
    error?: { code: string; message: string };
  }> {
    const result = (await this.requestWithAuth<{ job: unknown }>('GET', `/autofills/${jobId}`)) as { job: { id: string; status: string; result?: unknown; error?: unknown } };
    return result.job as {
      id: string;
      status: 'in_progress' | 'success' | 'failed';
      result?: { type: string; design?: { id: string; title?: string; url?: string; urls?: { edit_url: string; view_url: string } } };
      error?: { code: string; message: string };
    };
  }

  /** Whether design API is available (has OAuth tokens). */
  hasDesignTokens(): boolean {
    const at = this.accessToken || process.env.CANVA_ACCESS_TOKEN || '';
    const rt = this.refreshToken || process.env.CANVA_REFRESH_TOKEN || '';
    return Boolean(at || rt);
  }
}
