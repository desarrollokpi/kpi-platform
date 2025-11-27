const rolesRepository = require("../roles/roles.repository");
const { ROLE_NAMES } = require("../constants/roles");

/**
 * Main role authorization middleware
 * Accepts an array of allowed roles
 * Usage: roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN])
 */
function roleAuth(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      // If no roles specified, just check if user is authenticated
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if user has any of the allowed roles
      for (const roleName of allowedRoles) {
        const hasRole = await rolesRepository.userHasRole(userId, roleName);
        if (hasRole) {
          return next();
        }
      }

      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`,
      });
    } catch (error) {
      console.error("roleAuth middleware error:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}

/**
 * Middleware to check if user is Root Admin
 */
const isRootAdmin = roleAuth([ROLE_NAMES.ROOT_ADMIN]);

/**
 * Middleware to check if user is Tenant Admin
 */
const isTenantAdmin = roleAuth([ROLE_NAMES.TENANT_ADMIN]);

/**
 * Middleware to check if user is Root Admin OR Tenant Admin
 */
const isAnyAdmin = roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]);

/**
 * Middleware to check if user has a specific role
 */
function hasRole(roleName) {
  return roleAuth([roleName]);
}

/**
 * Middleware to check if user has any of the specified roles
 */
function hasAnyRole(...roleNames) {
  return roleAuth(roleNames);
}

// Export main function as default
module.exports = roleAuth;

// Export helpers
module.exports.isRootAdmin = isRootAdmin;
module.exports.isTenantAdmin = isTenantAdmin;
module.exports.isAnyAdmin = isAnyAdmin;
module.exports.hasRole = hasRole;
module.exports.hasAnyRole = hasAnyRole;
module.exports.ROLE_NAMES = ROLE_NAMES;
