import OpenAI from "openai";

// Using Replit's AI Integrations service - blueprint: javascript_openai_ai_integrations
// This provides OpenAI-compatible API access without requiring your own API key
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export { openai };
