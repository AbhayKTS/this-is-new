import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRateLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => res.json({ 
  status: "ok", 
  env: process.env.NODE_ENV || "development",
  timestamp: new Date().toISOString(),
}));

// Apply rate limiting to sensitive routes
app.use(["/api/auth", "/api/verification"], authRateLimiter);

// API routes
app.use("/api", routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
