import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import{ChatOpenRouter} from '@langchain/openrouter';
export interface LLMProvider {
  id: string; // Unique identifier (e.g., 'groq-key-1')
  name: string; // Readable name
  type: string;
  client: any;
  activeRequests: number;
  cooldownUntil: number; // timestamp
  priority: number; // Higher value higher priority
  totalRequestsRouted: number;
}

@Injectable()
export class LlmGatewayService implements OnModuleInit {
  private readonly logger = new Logger(LlmGatewayService.name);
  private providers: LLMProvider[] = [];

  onModuleInit() {
    this.initializeFromEnv();
  }
  // Get the keys from the env
  private initializeFromEnv() {
    // 1. Load Openrouter 
    const openrouter = this.parseKeys(process.env.OPENROUTER_API_KEY);
    if (openrouter) {
      openrouter.forEach((key, index) => this.addProvider(`openrouter-key-${index + 1}`, `Open router key #${index + 1}`, 'openrouter', key, 1))
    }
    
    // 2. Load Groq Keys
    const groqKeys = this.parseKeys(process.env.GROQ_API_KEY);
    groqKeys.forEach((key, index) => {
      this.addProvider(`groq - key - ${ index + 1} `, `Groq Cloud Key #${ index + 1 } `, 'groq', key, 2);
    });
    
    // 3. Gemma model
    const geminiKeys = this.parseKeys(process.env.GEMINI_API_KEY)
    geminiKeys.forEach((key, index) => {
      this.addProvider(`gemini - key - ${ index + 1 } `, `Gemini Cloud Key #${ index + 1 } `, 'gemini', key, 3);
    });
    
    // 4. Load OmniRoute
    const omnirouteKey = process.env.OMNIROUTE_API_KEY;
    if (omnirouteKey) {
      this.addProvider('omniroute', 'OmniRoute Provider', 'omniroute', omnirouteKey, 4);
    }
  }

  /* Dynamically adds a new LLM provider/key to the active pool at runtime*/
  addProvider(id: string, name: string, type: string, apiKey: string, priority = 1) {
    if (!apiKey) return;

    // Ensure we remove any existing provider with the same ID
    this.removeProvider(id);

    let client: any;
    if(type === 'openrouter'){
      client = new ChatOpenRouter({
        model: 'meta-llama/llama-3.3-70b-instruct',
        apiKey,
        temperature:0,
      })
    }
    else if (type === 'groq') {
      client = new ChatGroq({
        apiKey,
        model: 'openai/gpt-oss-120b',
        temperature: 0,
      });
    } else if(type === 'gemini') {
        client = new ChatGoogleGenerativeAI({
          apiKey,
          modelName: 'gemma-4-31b-it',
          temperature: 0,
        });
      }
      else if (type === 'omniroute') {
        const baseUrl = process.env.OMNIROUTE_URL;
        const modelName = 'auto/best-free';
        client = new ChatOpenAI({
          apiKey,
          configuration: {
            baseURL: baseUrl,
          },
          modelName,
          temperature: 0,
        });
      }
      this.providers.push({
        id,
        name,
        type,
        client,
        activeRequests: 0,
        cooldownUntil: 0,
        priority,
        totalRequestsRouted: 0,
      });
      this.logger.log(`[LLM - GATEWAY] Added provider: ${ name } (ID: ${ id })`);
    }

    /**
     * Dynamically removes an LLM provider/key from the active pool at runtime.
     */
    removeProvider(id: string) {
      const beforeCount = this.providers.length;
      this.providers = this.providers.filter(p => p.id !== id);
      if (this.providers.length < beforeCount) {
        this.logger.log(`[LLM - GATEWAY] Removed provider ID: ${ id } `);
      }
    }

    /**
     * Returns current active providers and their health/load status.
     */
    getProviders() {
      const now = Date.now();
      return this.providers.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        activeRequests: p.activeRequests,
        isCoolingDown: p.cooldownUntil > now,
        cooldownRemainingSec: p.cooldownUntil > now ? Math.round((p.cooldownUntil - now) / 1000) : 0,
        priority: p.priority,
      }));
    }

  /**
   * Executes LLM requests by routing to the healthiest key with the lowest concurrent traffic.
   */
  async invokeLLM < T = any > (
      promptRunner: (model: BaseChatModel) => Promise<T>,
        maxRetries = 2
  ): Promise < T > {
      let attempts = 0;

      while(attempts <= maxRetries) {
      const provider = this.getBestProvider();
      if (!provider) {
        throw new Error('[LLM-GATEWAY] No healthy LLM providers/keys are currently available.');
      }

      provider.activeRequests++;
      provider.totalRequestsRouted++;
      this.logger.log(`[LLM - GATEWAY] Routing request to: ${ provider.name } (Active Load: ${ provider.activeRequests }, Total Routed: ${ provider.totalRequestsRouted })`);

      try {
        const result = await promptRunner(provider.client);
        provider.activeRequests--;
        return result;
      } catch (err) {
        provider.activeRequests--;
        attempts++;

        const isRateLimit = err.message?.includes('429') || err.message?.includes('rate limit');
        const cooldownMs = isRateLimit ? 60000 : 15000; // 60s cooldown for rate limits, 15s for other errors
        provider.cooldownUntil = Date.now() + cooldownMs;

        this.logger.warn(
          `[LLM - GATEWAY] Key[${ provider.id }]failed(Attempt ${ attempts } / ${ maxRetries + 1}). Entering cooldown for ${ cooldownMs / 1000}s.Error: ${ err.message } `
        );

        if (attempts > maxRetries) {
          throw new Error(`[LLM - GATEWAY] All fallback providers exhausted.Final error: ${ err.message } `);
        }
      }
    }
    throw new Error('[LLM-GATEWAY] Request invocation failed.');
  }

  private getBestProvider(): LLMProvider | null {
    const now = Date.now();
    const healthy = this.providers.filter(p => p.cooldownUntil <= now);

    if (healthy.length === 0) {
      // Emergency: Return the key that will complete its cooldown earliest
      if (this.providers.length > 0) {
        return this.providers.reduce((earliest, p) => p.cooldownUntil < earliest.cooldownUntil ? p : earliest);
      }
      return null;
    }

    // Sort by: 1. Priority (lower value first) -> 2. Load (fewer active requests first) -> 3. Total requests routed (fewer first)
    return healthy.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      if (a.activeRequests !== b.activeRequests) {
        return a.activeRequests - b.activeRequests;
      }
      return (a.totalRequestsRouted || 0) - (b.totalRequestsRouted || 0);
    })[0];
  }

  private parseKeys(raw: string | undefined): string[] {
    if (!raw) return [];
    return raw.split(',').map(k => k.trim()).filter(Boolean);
  }
}