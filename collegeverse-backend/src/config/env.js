import dotenv from "dotenv";

dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_KEY"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
  nodeEnv: process.env.NODE_ENV || "development",
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o",
  openaiMaxTokens: Number(process.env.OPENAI_MAX_TOKENS) || 1000,
  
  // AI Feature Flags
  aiEnabled: process.env.AI_ENABLED !== "false",
  aiModerationEnabled: process.env.AI_MODERATION_ENABLED !== "false",
};
