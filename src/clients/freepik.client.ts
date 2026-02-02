import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const FREEPIK_API_BASE = 'https://api.freepik.com/v1';

export interface FreepikSearchOptions {
  term?: string;
  page?: number;
  limit?: number;
  order?: 'relevance' | 'recent';
  filters?: Record<string, unknown>;
}

export interface FreepikResource {
  id: number;
  title: string;
  url: string;
  filename: string;
  licenses: Array<{ type: string; url: string }>;
  image?: {
    type: string;
    orientation: string;
    source: { url: string; key: string; size: string };
  };
  stats?: { downloads: number; likes: number };
  author?: { id: number; name: string; avatar: string; slug: string };
  meta?: Record<string, unknown>;
}

export interface FreepikSearchResponse {
  data: FreepikResource[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    clean_search?: boolean;
  };
}

export class FreepikClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FREEPIK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: FREEPIK_API_KEY not set');
    }
  }

  private async request<T>(method: 'GET', path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(path.startsWith('http') ? path : `${FREEPIK_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'x-freepik-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Freepik API error: ${response.status} ${(err as { message?: string }).message || response.statusText}`
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Search resources (images, vectors, templates) by term.
   */
  async searchResources(options: FreepikSearchOptions = {}): Promise<FreepikSearchResponse> {
    const { term, page = 1, limit = 20, order = 'relevance', filters } = options;
    const params: Record<string, string | number | undefined> = {
      page,
      limit,
      order,
      ...(term && { term }),
    };
    if (filters && Object.keys(filters).length > 0) {
      params.filters = JSON.stringify(filters);
    }
    return this.request<FreepikSearchResponse>('GET', '/resources', params);
  }

  /**
   * Get a single resource by ID.
   */
  async getResource(resourceId: string | number): Promise<FreepikResource> {
    const data = await this.request<{ data: FreepikResource }>('GET', `/resources/${resourceId}`);
    return (data as { data: FreepikResource }).data;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}
