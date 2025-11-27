/**
 * Input Validation Utilities
 * Centralized validation functions for better security and consistency
 */

/**
 * Validate email format
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
exports.isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate ID (positive integer)
 */
exports.isValidId = (id) => {
  const numId = Number(id);
  return Number.isInteger(numId) && numId > 0;
};

/**
 * Validate UUID/GUID format (for Superset IDs)
 */
exports.isValidUuid = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid) || /^[a-zA-Z0-9_-]+$/.test(uuid);
};

/**
 * Validate active status
 */
exports.isValidActiveStatus = (active) => {
  return active === 0 || active === 1 || active === true || active === false;
};

/**
 * Sanitize string input (remove dangerous characters)
 */
exports.sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>'"]/g, '');
};

/**
 * Validate role name
 */
exports.isValidRoleName = (roleName) => {
  const validRoles = ['root_admin', 'tenant_admin', 'user'];
  return validRoles.includes(roleName);
};

/**
 * Validate required fields in object
 */
exports.validateRequiredFields = (obj, requiredFields) => {
  const missing = [];
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(field);
    }
  }
  return {
    isValid: missing.length === 0,
    missing
  };
};

/**
 * Validate pagination parameters
 */
exports.validatePagination = (page, limit) => {
  const numPage = Number(page) || 1;
  const numLimit = Number(limit) || 10;

  return {
    page: Math.max(1, numPage),
    limit: Math.min(100, Math.max(1, numLimit)), // Max 100 items per page
    offset: (Math.max(1, numPage) - 1) * Math.min(100, Math.max(1, numLimit))
  };
};

/**
 * Validate array of IDs
 */
exports.validateIdArray = (ids) => {
  if (!Array.isArray(ids)) return false;
  return ids.every(id => exports.isValidId(id));
};

/**
 * Validate Superset instance data
 */
exports.validateSupersetInstance = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (data.name.length < 3 || data.name.length > 100) {
    errors.push('Name must be between 3 and 100 characters');
  }

  if (!data.baseUrl || typeof data.baseUrl !== 'string') {
    errors.push('Base URL is required and must be a string');
  } else if (!exports.isValidUrl(data.baseUrl)) {
    errors.push('Base URL must be a valid HTTP/HTTPS URL');
  }

  if (data.active !== undefined && !exports.isValidActiveStatus(data.active)) {
    errors.push('Active must be 0, 1, true, or false');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate report assignment data
 */
exports.validateReportAssignment = (data) => {
  const errors = [];

  if (!data.reportId) {
    errors.push('Report ID is required');
  }

  if (data.active !== undefined && !exports.isValidActiveStatus(data.active)) {
    errors.push('Active must be 0, 1, true, or false');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate workspace assignment data
 */
exports.validateWorkspaceAssignment = (data) => {
  const errors = [];

  if (!data.workspaceId) {
    errors.push('Workspace ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
