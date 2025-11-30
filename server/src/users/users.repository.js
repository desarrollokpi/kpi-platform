const { db } = require("../../database");
const { eq, and, isNull, ne } = require("drizzle-orm");
const { users, roles, usersRoles } = require("../db/schema");
const { handleDbError } = require("../common/dbErrorMapper");

exports.createUser = async (userData) => {
  try {
    const values = {
      userName: userData.userName ?? userData.username,
      name: userData.name ?? null,
      mail: userData.mail,
      password: userData.password,
      active: userData.active !== undefined ? userData.active : true,
    };

    // accountId is optional (for root admin users it should be null)
    if (Object.prototype.hasOwnProperty.call(userData, "accountId")) {
      values.accountId = userData.accountId;
    }

    const [result] = await db.insert(users).values(values);
    return result;
  } catch (error) {
    handleDbError(error, "Failed to create user");
  }
};

exports.findById = async (id) => {
  const result = await db
    .select({
      id: users.id,
      accountId: users.accountId,
      userName: users.userName,
      name: users.name,
      mail: users.mail,
      password: users.password,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findByIdWithRoles = async (id) => {
  const usersResult = await db
    .select({
      id: users.id,
      accountId: users.accountId,
      userName: users.userName,
      name: users.name,
      mail: users.mail,
      password: users.password,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);

  const user = usersResult[0];
  if (!user) {
    return null;
  }

  const rolesResult = await db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(usersRoles)
    .innerJoin(roles, and(eq(usersRoles.roleId, roles.id), isNull(roles.deletedAt)))
    .where(and(eq(usersRoles.userId, id), isNull(usersRoles.deletedAt)));

  const rolesList = rolesResult.filter((row) => row.id !== null).map((row) => ({ id: row.id, name: row.name }));

  return {
    ...user,
    roles: rolesList,
  };
};

exports.findByEmail = async (email) => {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.mail, email), isNull(users.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findByUsername = async (username) => {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.userName, username), isNull(users.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findAll = async (options = {}) => {
  const { active, accountId, limit, offset } = options;

  let conditions = [isNull(users.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(users.active, active));
  }

  if (accountId !== undefined) {
    conditions.push(eq(users.accountId, accountId));
  }

  let query = db
    .select({
      id: users.id,
      accountId: users.accountId,
      userName: users.userName,
      name: users.name,
      mail: users.mail,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(...conditions));

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query;
};

exports.count = async (activeOnly = false, accountId = null) => {
  const conditions = [isNull(users.deletedAt)];

  if (activeOnly) {
    conditions.push(eq(users.active, true));
  }

  if (accountId !== null) {
    conditions.push(eq(users.accountId, accountId));
  }

  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(and(...conditions));

  return result.length;
};

exports.findByAccountId = async (accountId) => {
  return await db
    .select({
      id: users.id,
      accountId: users.accountId,
      userName: users.userName,
      name: users.name,
      mail: users.mail,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(eq(users.accountId, accountId), isNull(users.deletedAt)));
};

exports.getForSelect = async ({ accountId = null, active = true } = {}) => {
  const conditions = [isNull(users.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(users.active, active));
  }

  if (accountId !== null && accountId !== undefined) {
    conditions.push(eq(users.accountId, accountId));
  }

  return await db
    .select({
      label: users.userName,
      value: users.id,
    })
    .from(users)
    .where(and(...conditions));
};

exports.updateUser = async (id, data) => {
  const updateData = {};

  if (data.username !== undefined) updateData.userName = data.username;
  if (data.userName !== undefined) updateData.userName = data.userName;
  if (data.mail !== undefined) updateData.mail = data.mail;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.active !== undefined) updateData.active = data.active;

  updateData.updatedAt = new Date();

  try {
    return await db.update(users).set(updateData).where(eq(users.id, id));
  } catch (error) {
    handleDbError(error, "Failed to update user");
  }
};

exports.softDelete = async (id) => {
  try {
    return await db.update(users).set({ active: false, deletedAt: new Date() }).where(eq(users.id, id));
  } catch (error) {
    handleDbError(error, "Failed to deactivate user");
  }
};

exports.activate = async (id) => {
  try {
    return await db.update(users).set({ active: true, updatedAt: new Date() }).where(eq(users.id, id));
  } catch (error) {
    handleDbError(error, "Failed to activate user");
  }
};

exports.deactivate = async (id) => {
  try {
    return await db.update(users).set({ active: false, updatedAt: new Date() }).where(eq(users.id, id));
  } catch (error) {
    handleDbError(error, "Failed to deactivate user");
  }
};

exports.updatePassword = async (id, hashedPassword) => {
  try {
    return await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, id));
  } catch (error) {
    handleDbError(error, "Failed to update user password");
  }
};

exports.emailExists = async (email, excludeId = null) => {
  const conditions = [eq(users.mail, email), isNull(users.deletedAt)];

  if (excludeId) {
    conditions.push(ne(users.id, excludeId));
  }

  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(and(...conditions));

  return result.length > 0;
};

exports.usernameExists = async (username, excludeId = null) => {
  const conditions = [eq(users.userName, username), isNull(users.deletedAt)];

  if (excludeId) {
    conditions.push(ne(users.id, excludeId));
  }

  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(and(...conditions));

  return result.length > 0;
};

module.exports = exports;
