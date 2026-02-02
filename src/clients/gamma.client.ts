import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const GAMMA_API_BASE = 'https://public-api.gamma.app/v1.0';

export interface GammaCreateOptions {
  inputText: string;
  format?: 'presentation' | 'document' | 'social';
  textMode?: 'generate' | 'condense' | 'preserve';
  themeName?: string;
  numCards?: number;
  cardSplit?: 'auto' | 'inputTextBreaks';
  additionalInstructions?: string;
  exportAs?: 'pdf' | 'pptx';
  textOptions?: {
    amount?: 'brief' | 'medium' | 'detailed' | 'extensive';
    tone?: string;
    audience?: string;
    language?: string;
  };
  imageOptions?: {
    source?: 'aiGenerated' | 'pictographic' | 'unsplash' | 'giphy' | 'webAllImages' | 'webFreeToUse' | 'webFreeToUseCommercially' | 'placeholder' | 'noImages';
    model?: string;
    style?: string;
  };
  cardOptions?: { dimensions?: string };
  sharingOptions?: { workspaceAccess?: string; externalAccess?: string };
}

export interface GammaCreateResponse {
  generationId: string;
}

export interface GammaGenerationStatus {
  generationId: string;
  status: 'pending' | 'completed';
  gammaUrl?: string;
  credits?: { deducted: number; remaining: number };
}

export class GammaClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GAMMA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: GAMMA_API_KEY not set');
    }
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = path.startsWith('http') ? path : `${GAMMA_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

    const headers: Record<string, string> = {
      'X-API-KEY': this.apiKey,
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        `Gamma API error: ${response.status} ${(data as { message?: string }).message || response.statusText}`
      );
    }

    return data as T;
  }

  /**
   * Create a presentation, document, or social post.
   * Returns generationId; poll getGenerationStatus(id) for completion and gammaUrl.
   */
  async createGeneration(options: GammaCreateOptions): Promise<GammaCreateResponse> {
    const { inputText, ...rest } = options;
    if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
      throw new Error('inputText is required (1–750,000 characters)');
    }
    return this.request<GammaCreateResponse>('POST', '/generations', { inputText: inputText.trim(), ...rest });
  }

  /**
   * Get generation status and result (gammaUrl when status === 'completed').
   */
  async getGenerationStatus(generationId: string): Promise<GammaGenerationStatus> {
    return this.request<GammaGenerationStatus>('GET', `/generations/${generationId}`);
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}
