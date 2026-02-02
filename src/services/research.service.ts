import { PerplexityClient } from '../clients/perplexity.client.js';
import { AnthropicClient } from '../clients/anthropic.client.js';
import type { ResearchRequest, ResearchResult, CacheEntry } from '../types/index.js';

export class ResearchService {
  private perplexityClient: PerplexityClient;
  private anthropicClient: AnthropicClient;
  private cache: Map<string, CacheEntry<ResearchResult>>;
  private cacheTTL: number = 3600000; // 1 hour in milliseconds

  constructor() {
    this.perplexityClient = new PerplexityClient();
    this.anthropicClient = new AnthropicClient();
    this.cache = new Map();
  }

  /**
   * Main research method that orchestrates parallel API calls
   */
  async conductResearch(request: ResearchRequest): Promise<ResearchResult> {
    const { topic, depth = 'detailed' } = request;
    
    // Check cache first
    const cacheKey = this.getCacheKey(topic, depth);
    const cachedResult = this.getFromCache(cacheKey);
    
    if (cachedResult) {
      console.log(`Cache hit for topic: ${topic}`);
      return { ...cachedResult, cached: true };
    }

    console.log(`Starting research for topic: ${topic} with depth: ${depth}`);

    try {
      // Call both APIs in parallel for speed
      const [perplexityData, claudeAnalysis] = await Promise.allSettled([
        this.getPerplexityResearch(topic, depth),
        this.getClaudeAnalysis(topic, depth),
      ]);

      // Extract results, handling potential failures gracefully
      const perplexityResult = perplexityData.status === 'fulfilled' ? perplexityData.value : null;
      const claudeResult = claudeAnalysis.status === 'fulfilled' ? claudeAnalysis.value : null;

      // Combine insights from both sources
      const combinedInsights = await this.combineInsights(
        topic,
        perplexityResult,
        claudeResult
      );

      // Extract sources from Perplexity response
      const sources = this.extractSources(perplexityResult);

      const result: ResearchResult = {
        topic,
        perplexityData: perplexityResult,
        claudeAnalysis: claudeResult || undefined,
        combinedInsights,
        sources,
        timestamp: new Date().toISOString(),
        cached: false,
      };

      // Cache the result
      this.saveToCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Research error:', error);
      throw new Error(`Failed to conduct research on topic: ${topic}`);
    }
  }

  /**
   * Get research from Perplexity API
   */
  private async getPerplexityResearch(topic: string, depth: string): Promise<any> {
    const query = this.buildPerplexityQuery(topic, depth);
    return await this.perplexityClient.search(query);
  }

  /**
   * Get analysis from Claude
   */
  private async getClaudeAnalysis(topic: string, depth: string): Promise<string> {
    const prompt = this.buildClaudePrompt(topic, depth);
    return await this.anthropicClient.analyze(prompt);
  }

  /**
   * Combine insights from both APIs using Claude
   */
  private async combineInsights(
    topic: string,
    perplexityData: any,
    claudeAnalysis: string | null
  ): Promise<string> {
    // Extract the actual content from Perplexity response
    const perplexityContent = perplexityData?.choices?.[0]?.message?.content || 'No data available';

    const combinationPrompt = `
You are synthesizing research on the topic: "${topic}"

Research from Perplexity (includes current web data):
${perplexityContent}

Initial Analysis:
${claudeAnalysis || 'No analysis available'}

Your task: Create a comprehensive, well-structured summary that:
1. Combines the most important insights from both sources
2. Organizes information logically with clear sections
3. Highlights key takeaways and actionable insights
4. Identifies any contradictions or gaps
5. Provides a balanced, objective perspective

Format your response with clear headings and bullet points for readability.
`;

    return await this.anthropicClient.analyze(combinationPrompt);
  }

  /**
   * Build query for Perplexity based on depth
   */
  private buildPerplexityQuery(topic: string, depth: string): string {
    const depthInstructions = {
      basic: 'Provide a brief overview',
      detailed: 'Provide detailed information with examples',
      comprehensive: 'Provide comprehensive, in-depth analysis with multiple perspectives',
    };

    return `${depthInstructions[depth as keyof typeof depthInstructions] || depthInstructions.detailed} about: ${topic}`;
  }

  /**
   * Build prompt for Claude based on depth
   */
  private buildClaudePrompt(topic: string, depth: string): string {
    const depthInstructions = {
      basic: 'Provide a concise analysis focusing on the most important aspects',
      detailed: 'Provide a detailed analysis covering key aspects, implications, and context',
      comprehensive: 'Provide a comprehensive analysis including history, current state, future implications, different perspectives, and potential challenges',
    };

    return `Analyze the following topic: "${topic}"\n\n${depthInstructions[depth as keyof typeof depthInstructions] || depthInstructions.detailed}`;
  }

  /**
   * Extract sources/citations from Perplexity response
   */
  private extractSources(perplexityData: any): string[] {
    if (!perplexityData?.citations) {
      return [];
    }
    return Array.isArray(perplexityData.citations) ? perplexityData.citations : [];
  }

  /**
   * Cache management methods
   */
  private getCacheKey(topic: string, depth: string): string {
    return `${topic.toLowerCase().trim()}_${depth}`;
  }

  private getFromCache(key: string): ResearchResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.cacheTTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private saveToCache(key: string, data: ResearchResult): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear expired cache entries
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return {
      size: this.cache.size,
      ttl: this.cacheTTL,
    };
  }
}
