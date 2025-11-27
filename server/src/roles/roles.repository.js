const { db } = require("../../database");
const { eq, and, or, isNull } = require("drizzle-orm");
const { usersRoles, roles, users } = require("../db/schema");

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
  return await db.insert(usersRoles).values({ usersId: userId, rolesId: roleId });
};

exports.removeRoleFromUser = async (userId, roleId) => {
  return await db.delete(usersRoles).where(and(eq(usersRoles.usersId, userId), eq(usersRoles.rolesId, roleId)));
};

exports.getUserRoles = async (userId) => {
  const result = await db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(usersRoles)
    .innerJoin(roles, eq(usersRoles.rolesId, roles.id))
    .where(eq(usersRoles.usersId, userId));

  return result;
};

exports.userHasRole = async (userId, roleName) => {
  const result = await db
    .select({ id: roles.id })
    .from(usersRoles)
    .innerJoin(roles, eq(usersRoles.rolesId, roles.id))
    .where(and(eq(usersRoles.usersId, userId), eq(roles.name, roleName)))
    .limit(1);

  return result.length > 0;
};

exports.getUsersByRole = async (roleName) => {
  const result = await db
    .select({
      id: users.id,
      userName: users.userName,
      mail: users.mail,
      accountsId: users.accountsId,
      active: users.active,
    })
    .from(usersRoles)
    .innerJoin(roles, eq(usersRoles.rolesId, roles.id))
    .innerJoin(users, eq(usersRoles.usersId, users.id))
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
    .innerJoin(roles, eq(usersRoles.rolesId, roles.id))
    .where(and(eq(usersRoles.usersId, userId), or(eq(roles.name, "root_admin"), eq(roles.name, "tenant_admin"))))
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
