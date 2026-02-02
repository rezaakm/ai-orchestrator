import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export class AnthropicClient {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!apiKey) {
      console.warn('Warning: ANTHROPIC_API_KEY not set');
    }
    this.client = new Anthropic({ apiKey });
  }

  async analyze(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nTask: ${prompt}`
        : prompt;

      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      const textContent = message.content.find(block => block.type === 'text');
      return textContent && textContent.type === 'text' ? textContent.text : '';
    } catch (error) {
      console.error('Anthropic analysis error:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, maxTokens: number = 2048): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = message.content.find(block => block.type === 'text');
      return textContent && textContent.type === 'text' ? textContent.text : '';
    } catch (error) {
      console.error('Content generation error:', error);
      throw error;
    }
  }
}
