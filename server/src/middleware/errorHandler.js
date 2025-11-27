/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors automatically
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes
 */
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.errors = errors;
  }
}

class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}

class ConflictError extends Error {
  constructor(message = "Resource conflict") {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
  }
}

/**
 * Global error handler middleware
 * Must be registered after all routes
 */
exports.errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Default error response
  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || "Internal server error",
  };

  // Add validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development" && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler for undefined routes
 * Must be registered after all routes but before error handler
 */
exports.notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.url}`);
  next(error);
};

// Export custom error classes
exports.ValidationError = ValidationError;
exports.NotFoundError = NotFoundError;
exports.UnauthorizedError = UnauthorizedError;
exports.ForbiddenError = ForbiddenError;
exports.ConflictError = ConflictError;
