import OpenAI from "openai";

// OpenAI client configuration
// For local development: Uses OPENAI_API_KEY from environment
// For Replit deployment: Uses Replit's AI Integrations service (javascript_openai_ai_integrations)
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'dummy-key-for-local-dev'
});

export { openai };
