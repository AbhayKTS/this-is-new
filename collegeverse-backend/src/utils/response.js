export const success = (res, data = null, message = "ok") => {
  res.status(200).json({ success: true, message, data });
};

export const created = (res, data = null, message = "created") => {
  res.status(201).json({ success: true, message, data });
};

export const badRequest = (res, message = "invalid request", details) => {
  res.status(400).json({ success: false, message, details });
};

export const unauthorized = (res, message = "unauthorized") => {
  res.status(401).json({ success: false, message });
};

export const notFound = (res, message = "not found") => {
  res.status(404).json({ success: false, message });
};

export const serverError = (res, message = "internal server error", details) => {
  res.status(500).json({ success: false, message, details });
};
