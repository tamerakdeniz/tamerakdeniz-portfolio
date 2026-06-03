import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_PRIMARY = 'gemini-3.1-flash-lite';
const DEFAULT_FALLBACK = 'gemini-2.5-flash-lite';

function getModelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_PRIMARY;
  const fallback = process.env.GEMINI_MODEL_FALLBACK?.trim() || DEFAULT_FALLBACK;
  return [...new Set([primary, fallback].filter(Boolean))];
}

function isFallbackableError(errMsg: string): boolean {
  const lower = errMsg.toLowerCase();
  if (
    lower.includes('api key') ||
    lower.includes('permission') ||
    lower.includes('401') ||
    lower.includes('403')
  ) {
    return false;
  }
  return (
    lower.includes('429') ||
    lower.includes('503') ||
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('quota') ||
    lower.includes('resource_exhausted') ||
    lower.includes('too many requests') ||
    lower.includes('unavailable') ||
    lower.includes('high demand')
  );
}

export type GenerateChatOptions = {
  apiKey: string;
  systemInstruction: string;
  prompt: string;
  maxOutputTokens?: number;
};

export async function generateChatWithModelFallback(
  options: GenerateChatOptions
): Promise<string> {
  const { apiKey, systemInstruction, prompt, maxOutputTokens = 512 } = options;
  const models = getModelChain();
  let lastError = 'No Gemini models configured';

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          maxOutputTokens,
          temperature: 0.3,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (i > 0) {
        console.info(`[chat] fallback model succeeded: ${modelName}`);
      }
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.warn(`[chat] model ${modelName} failed:`, lastError);
      const hasAnother = i < models.length - 1;
      if (hasAnother && isFallbackableError(lastError)) continue;
      throw error;
    }
  }

  throw new Error(lastError);
}

export function getConfiguredModelChain(): string[] {
  return getModelChain();
}
