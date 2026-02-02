import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KREA_API_BASE = 'https://api.krea.ai';

export interface KreaImageGenerateOptions {
  prompt: string;
  width?: number;
  height?: number;
  strength?: number;
  seed?: string;
  steps?: number;
}

export interface KreaJobResponse {
  job_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  result: unknown;
}

export class KreaClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.KREA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: KREA_API_KEY not set');
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = path.startsWith('http') ? path : `${KREA_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Krea API error: ${response.status} ${(err as { message?: string }).message || response.statusText}`
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Generate an image using Krea Flux (fast, cheap).
   * Returns a job; poll getJob(job_id) or use webhook for result.
   */
  async generateImage(
    options: KreaImageGenerateOptions,
    webhookUrl?: string
  ): Promise<KreaJobResponse> {
    const path = '/generate/image/bfl/flux-1-dev';
    const body = {
      prompt: options.prompt,
      width: options.width ?? 1024,
      height: options.height ?? 1024,
      strength: options.strength ?? 1,
      seed: options.seed ?? String(Math.floor(Math.random() * 1e9)),
      steps: options.steps ?? 25,
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (webhookUrl) {
      headers['X-Webhook-URL'] = webhookUrl;
    }

    const response = await fetch(`${KREA_API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Krea API error: ${response.status} ${(err as { message?: string }).message || response.statusText}`
      );
    }

    return (await response.json()) as KreaJobResponse;
  }

  /**
   * Get job status and result by job_id.
   */
  async getJob(jobId: string): Promise<KreaJobResponse> {
    return this.request<KreaJobResponse>('GET', `/jobs/${jobId}`);
  }

  /**
   * List recent jobs.
   */
  async listJobs(): Promise<{ jobs: KreaJobResponse[] }> {
    return this.request<{ jobs: KreaJobResponse[] }>('GET', '/jobs');
  }

  /**
   * Delete a job by ID.
   */
  async deleteJob(jobId: string): Promise<unknown> {
    return this.request<unknown>('DELETE', `/jobs/${jobId}`);
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}
