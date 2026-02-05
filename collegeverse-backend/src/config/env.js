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
  
  // Web3 Configuration
  web3Enabled: process.env.WEB3_ENABLED !== "false",
  polygonRpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/demo",
  polygonChainId: Number(process.env.POLYGON_CHAIN_ID) || 80002, // Amoy testnet
  platformWalletPrivateKey: process.env.PLATFORM_WALLET_PRIVATE_KEY,
  
  // Smart Contract Addresses (deployed contracts)
  sbtContractAddress: process.env.SBT_CONTRACT_ADDRESS,
  badgeNftContractAddress: process.env.BADGE_NFT_CONTRACT_ADDRESS,
  
  // IPFS Configuration (Pinata)
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretKey: process.env.PINATA_SECRET_KEY,
  pinataGateway: process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs",
};
