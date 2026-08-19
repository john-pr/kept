import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI is not configured. Missing OPENAI_API_KEY.");
  }
  if (!client) {
    client = new OpenAI({ apiKey: OPENAI_API_KEY, maxRetries: 2 });
  }
  return client;
}

export const AI_MODEL = "gpt-5-nano";
