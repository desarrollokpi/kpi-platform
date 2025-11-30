const { ConflictError } = require("./exception");

// MySQL error codes we explicitly care about for now.
const MYSQL_ERROR_CODES = {
  DUP_ENTRY: "ER_DUP_ENTRY",
  NO_REFERENCED_ROW: "ER_NO_REFERENCED_ROW_2",
  ROW_IS_REFERENCED: "ER_ROW_IS_REFERENCED_2",
};

/**
 * Maps low level Drizzle/MySQL errors to domain errors understood by the
 * global error handler. This helper should be used in repositories so that
 * controllers and services never see raw driver errors.
 *
 * It always throws; callers should not return after invoking it.
 */
const handleDbError = (error, defaultMessage = "Database operation failed") => {
  const cause = error && error.cause ? error.cause : null;

  // Drizzle wraps the underlying MySQL error in `error.cause`.
  if (cause && cause.code) {
    const mysqlError = cause;

    // Unique constraint violation (duplicate key)
    if (mysqlError.code === MYSQL_ERROR_CODES.DUP_ENTRY) {
      // Prefer the low level message when available, but keep it generic.
      const message = defaultMessage || mysqlError.sqlMessage || "Unique constraint violated";
      throw new ConflictError(message);
    }

    // Foreign key problems and other constraint issues can be added here if needed.
    if (mysqlError.code === MYSQL_ERROR_CODES.NO_REFERENCED_ROW || mysqlError.code === MYSQL_ERROR_CODES.ROW_IS_REFERENCED) {
      throw new ConflictError(defaultMessage || "Foreign key constraint violated");
    }
  }

  // Fallback: rethrow the original error so it is still visible.
  throw error;
};

module.exports = {
  handleDbError,
};
