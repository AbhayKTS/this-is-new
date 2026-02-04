import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRateLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ status: "ok", env: env.nodeEnv }));

// apply rate limiting to auth-like routes that can be brute-forced
app.use(["/integrations/github", "/users", "/profiles"], authRateLimiter);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
