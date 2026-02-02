import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const GROK_API_BASE = 'https://api.x.ai/v1';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokChatOptions {
  messages: GrokMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface GrokChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export class GrokClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: GROK_API_KEY not set');
    }
  }

  /**
   * Send a chat completion request to Grok (xAI).
   */
  async chat(options: GrokChatOptions): Promise<string> {
    const {
      messages,
      model = 'grok-4-latest',
      max_tokens = 4096,
      temperature = 0,
      stream = false,
    } = options;

    const response = await fetch(`${GROK_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages,
        model,
        max_tokens,
        temperature,
        stream,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Grok API error: ${response.status} ${(err as { error?: { message?: string } }).error?.message || response.statusText}`
      );
    }

    const data = (await response.json()) as GrokChatResponse;
    const content = data.choices?.[0]?.message?.content;
    return content ?? '';
  }

  /**
   * Simple completion: single user prompt, optional system message.
   */
  async complete(prompt: string, systemPrompt?: string, maxTokens = 4096): Promise<string> {
    const messages: GrokMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    return this.chat({ messages, max_tokens: maxTokens, temperature: 0 });
  }

  /**
   * Analyze or reason over text (useful for research orchestration).
   */
  async analyze(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context
      ? `Context: ${context}\n\nTask: ${prompt}`
      : prompt;
    return this.complete(
      fullPrompt,
      'You are a helpful analyst. Provide clear, accurate analysis.'
    );
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}
