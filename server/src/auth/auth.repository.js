const { db } = require("../../database");
const { eq, and, or, isNull } = require("drizzle-orm");
const { users, usersRoles, roles, accounts } = require("../db/schema");

exports.findUserForAuthentication = async (identifier) => {
  const rows = await db
    .select({
      id: users.id,
      userName: users.userName,
      mail: users.mail,
      password: users.password,
      accountsId: users.accountsId,
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
    .leftJoin(accounts, eq(users.accountsId, accounts.id))
    .leftJoin(usersRoles, eq(users.id, usersRoles.usersId))
    .leftJoin(roles, eq(usersRoles.rolesId, roles.id))
    .where(and(or(eq(users.userName, identifier), eq(users.mail, identifier)), isNull(users.deletedAt)));

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
    accountsId: base.accountsId,
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
      accountsId: users.accountsId,
      active: users.active,
      accountId: accounts.id,
      accountName: accounts.name,
      accountSubdomain: accounts.subDomain,
      accountLogoAddress: accounts.logoAddress,
      roleId: roles.id,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(accounts, eq(users.accountsId, accounts.id))
    .leftJoin(usersRoles, eq(users.id, usersRoles.usersId))
    .leftJoin(roles, eq(usersRoles.rolesId, roles.id))
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
    accountsId: base.accountsId,
    active: base.active,
    accountId: base.accountId,
    accountName: base.accountName,
    accountSubdomain: base.accountSubdomain,
    accountLogoAddress: base.accountLogoAddress,
    roles: roleList,
  };
};

exports.updateLastLogin = async (userId) => {
  await db.update(users).set({ updatedAt: new Date() }).where(eq(users.id, userId));
};

module.exports = exports;
