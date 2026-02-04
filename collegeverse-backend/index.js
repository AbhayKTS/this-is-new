import app from "./src/app.js";
import { env } from "./src/config/env.js";

const server = app.listen(env.port, () => {
  console.log(`✅ Server running on http://localhost:${env.port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
