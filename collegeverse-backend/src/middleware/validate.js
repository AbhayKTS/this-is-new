import { ZodError } from "zod";

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
    }
    next(err);
  }
};

export const validateParams = (schema) => (req, res, next) => {
  try {
    req.validatedParams = schema.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
    }
    next(err);
  }
};
