import { serverError } from "../utils/response.js";

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  if (process.env.NODE_ENV !== "test") {
    console.error("[Error]", { status, message, stack: err.stack });
  }
  res.status(status).json({ success: false, message });
};
