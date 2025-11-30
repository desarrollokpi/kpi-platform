const { db } = require("../../database");
const { eq, and, or, isNull } = require("drizzle-orm");
const { usersRoles, roles, users } = require("../db/schema");
const { handleDbError } = require("../common/dbErrorMapper");

exports.getAllRoles = async () => {
  const result = await db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(and(eq(roles.active, true), isNull(roles.deletedAt)));
  return result;
};

exports.getRoleById = async (id) => {
  const result = await db.select({ id: roles.id, name: roles.name }).from(roles).where(eq(roles.id, id)).limit(1);
  return result[0] || null;
};

exports.getRoleByName = async (name) => {
  const result = await db.select({ id: roles.id, name: roles.name }).from(roles).where(eq(roles.name, name)).limit(1);
  return result[0] || null;
};

exports.assignRoleToUser = async (userId, roleId) => {
  try {
    return await db.insert(usersRoles).values({ userId, roleId });
  } catch (error) {
    handleDbError(error, "Failed to assign role to user");
  }
};

exports.removeRoleFromUser = async (userId, roleId) => {
  try {
    return await db.delete(usersRoles).where(and(eq(usersRoles.userId, userId), eq(usersRoles.roleId, roleId)));
  } catch (error) {
    handleDbError(error, "Failed to remove role from user");
  }
};

exports.getUserRoles = async (userId) => {
  const result = await db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(usersRoles)
    .innerJoin(roles, eq(usersRoles.roleId, roles.id))
    .where(eq(usersRoles.userId, userId));

  return result;
};

exports.userHasRole = async (userId, roleName) => {
  const result = await db
    .select({ id: roles.id })
    .from(usersRoles)
    .innerJoin(roles, eq(usersRoles.roleId, roles.id))
    .where(and(eq(usersRoles.userId, userId), eq(roles.name, roleName)))
    .limit(1);

  return result.length > 0;
};

exports.getUsersByRole = async (roleName) => {
  const result = await db
    .select({
      id: users.id,
      userName: users.userName,
      mail: users.mail,
      accountId: users.accountId,
      active: users.active,
    })
    .from(usersRoles)
    .innerJoin(roles, eq(usersRoles.roleId, roles.id))
    .innerJoin(users, eq(usersRoles.userId, users.id))
    .where(and(eq(roles.name, roleName), isNull(users.deletedAt)));

  return result;
};

exports.isRootAdmin = async (userId) => {
  return await exports.userHasRole(userId, "root_admin");
};

exports.isTenantAdmin = async (userId) => {
  return await exports.userHasRole(userId, "tenant_admin");
};

exports.isAdmin = async (userId) => {
  const result = await db
    .select({ id: roles.id })
    .from(usersRoles)
    .innerJoin(roles, eq(usersRoles.roleId, roles.id))
    .where(and(eq(usersRoles.userId, userId), or(eq(roles.name, "root_admin"), eq(roles.name, "tenant_admin"))))
    .limit(1);

  return result.length > 0;
};

exports.getRolesForSelect = async () => {
  const result = await db
    .select({ value: roles.id, label: roles.name })
    .from(roles)
    .where(and(eq(roles.active, true), isNull(roles.deletedAt)));
  return result;
};

module.exports = exports;
