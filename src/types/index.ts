// Common types for the AI orchestrator

export interface ResearchRequest {
  topic: string;
  depth?: 'basic' | 'detailed' | 'comprehensive';
}

export interface ResearchResult {
  topic: string;
  perplexityData?: any;
  claudeAnalysis?: string;
  combinedInsights: string;
  sources?: string[];
  timestamp: string;
  cached: boolean;
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: string;
  width?: number;
  height?: number;
  /** Optional webhook URL for Krea to POST when job completes */
  webhookUrl?: string;
}

export interface ContentGenerationRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Canva OAuth
export interface CanvaAuthUrlRequest {
  redirectUri: string;
  scopes?: string[];
}

export interface CanvaExchangeTokenRequest {
  code: string;
  codeVerifier: string;
  redirectUri?: string;
}

export interface CanvaRefreshTokenRequest {
  refreshToken: string;
}

/** Content for Canva autofill: text (string) or image (use asset_id from Canva Assets API). */
export interface CanvaCreateProposalRequest {
  templateId: string;
  title?: string;
  content: Record<string, string | { type: 'image'; asset_id: string }>;
}

// Grok chat
export interface GrokChatRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

// Gamma.app generations
export interface GammaCreateRequest {
  inputText: string;
  format?: 'presentation' | 'document' | 'social';
  textMode?: 'generate' | 'condense' | 'preserve';
  themeName?: string;
  numCards?: number;
  cardSplit?: 'auto' | 'inputTextBreaks';
  additionalInstructions?: string;
  exportAs?: 'pdf' | 'pptx';
  textOptions?: { amount?: 'brief' | 'medium' | 'detailed' | 'extensive'; tone?: string; audience?: string; language?: string };
  imageOptions?: { source?: 'aiGenerated' | 'pictographic' | 'unsplash' | 'giphy' | 'webAllImages' | 'webFreeToUse' | 'webFreeToUseCommercially' | 'placeholder' | 'noImages'; model?: string; style?: string };
  cardOptions?: { dimensions?: string };
  sharingOptions?: { workspaceAccess?: string; externalAccess?: string };
}

// Freepik stock content
export interface FreepikSearchRequest {
  term?: string;
  page?: number;
  limit?: number;
  order?: 'relevance' | 'recent';
}

// Krea image generation
export interface KreaImageGenerateRequest {
  prompt: string;
  width?: number;
  height?: number;
  strength?: number;
  seed?: string;
  steps?: number;
  webhookUrl?: string;
}
