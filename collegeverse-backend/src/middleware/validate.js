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

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.validatedQuery = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
    }
    next(err);
  }
};

// Combined validate helper for flexibility
export const validate = ({ body, params, query }) => {
  const middlewares = [];
  if (body) middlewares.push(validateBody(body));
  if (params) middlewares.push(validateParams(params));
  if (query) middlewares.push(validateQuery(query));
  
  return (req, res, next) => {
    const runMiddleware = (index) => {
      if (index >= middlewares.length) return next();
      middlewares[index](req, res, (err) => {
        if (err) return next(err);
        runMiddleware(index + 1);
      });
    };
    runMiddleware(0);
  };
};
