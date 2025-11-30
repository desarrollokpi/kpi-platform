const { db } = require("../../database");
const { eq, and, isNull } = require("drizzle-orm");
const { users, usersRoles, roles, accounts } = require("../db/schema");
const { handleDbError } = require("../common/dbErrorMapper");

exports.findUserForAuthentication = async (identifier) => {
  const rows = await db
    .select({
      id: users.id,
      userName: users.userName,
      mail: users.mail,
      password: users.password,
      accountId: users.accountId,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      accountId: accounts.id,
      accountName: accounts.name,
      accountSubdomain: accounts.subDomain,
      accountLogoAddress: accounts.logoAddress,
      accountActive: accounts.active,
      roleId: roles.id,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(accounts, eq(users.accountId, accounts.id))
    .leftJoin(usersRoles, eq(users.id, usersRoles.userId))
    .leftJoin(roles, eq(usersRoles.roleId, roles.id))
    .where(and(eq(users.mail, identifier), isNull(users.deletedAt)));

  if (!rows.length) {
    return null;
  }

  const base = rows[0];
  const roleList = rows
    .filter((row) => row.roleId !== null)
    .map((row) => ({
      id: row.roleId,
      name: row.roleName,
    }));

  return {
    id: base.id,
    userName: base.userName,
    mail: base.mail,
    password: base.password,
    accountId: base.accountId,
    active: base.active,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    accountId: base.accountId,
    accountName: base.accountName,
    accountSubdomain: base.accountSubdomain,
    accountLogoAddress: base.accountLogoAddress,
    accountActive: base.accountActive,
    roles: roleList,
  };
};

exports.getUserSessionInfo = async (userId) => {
  const rows = await db
    .select({
      id: users.id,
      userName: users.userName,
      mail: users.mail,
      accountId: users.accountId,
      active: users.active,
      accountId: accounts.id,
      accountName: accounts.name,
      accountSubdomain: accounts.subDomain,
      accountLogoAddress: accounts.logoAddress,
      roleId: roles.id,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(accounts, eq(users.accountId, accounts.id))
    .leftJoin(usersRoles, eq(users.id, usersRoles.userId))
    .leftJoin(roles, eq(usersRoles.roleId, roles.id))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)));

  if (!rows.length) {
    return null;
  }

  const base = rows[0];
  const roleList = rows
    .filter((row) => row.roleId !== null)
    .map((row) => ({
      id: row.roleId,
      name: row.roleName,
    }));

  return {
    id: base.id,
    userName: base.userName,
    mail: base.mail,
    active: base.active,
    accountId: base.accountId,
    accountName: base.accountName,
    accountSubdomain: base.accountSubdomain,
    accountLogoAddress: base.accountLogoAddress,
    roles: roleList,
  };
};

exports.updateLastLogin = async (userId) => {
  try {
    await db.update(users).set({ updatedAt: new Date() }).where(eq(users.id, userId));
  } catch (error) {
    handleDbError(error, "Failed to update last login");
  }
};

module.exports = exports;
