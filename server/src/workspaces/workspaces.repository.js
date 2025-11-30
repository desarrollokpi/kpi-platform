const { db } = require("../../database");
const { eq, and, isNull, sql } = require("drizzle-orm");
const { workspaces, accountsInstancesWorkspaces, accountsInstances, usersWorkspaces } = require("../db/schema");
const { instances } = require("../db/schema/instances");
const { handleDbError } = require("../common/dbErrorMapper");

exports.createWorkspace = async (workspaceData) => {
  try {
    const result = await db.insert(workspaces).values(workspaceData);
    return result[0];
  } catch (error) {
    handleDbError(error, "Failed to create workspace");
  }
};

exports.findById = async (id) => {
  const result = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, id), isNull(workspaces.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findByUuid = async (uuid) => {
  const result = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.uuid, uuid), isNull(workspaces.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findAccountInstance = async (accountId, instanceId) => {
  const result = await db
    .select()
    .from(accountsInstances)
    .where(and(eq(accountsInstances.accountId, accountId), eq(accountsInstances.instanceId, instanceId), isNull(accountsInstances.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findAll = async (options = {}) => {
  const { active, limit, offset, accountId } = options;

  const conditions = [isNull(workspaces.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(workspaces.active, active));
  }

  if (accountId) {
    conditions.push(eq(accountsInstances.accountId, accountId));
  }

  let query = db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      active: workspaces.active,
      deletedAt: workspaces.deletedAt,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      accountId: sql`MIN(${accountsInstances.accountId})`.as("accountId"),
      instanceId: sql`MIN(${accountsInstances.instanceId})`.as("instanceId"),
    })
    .from(workspaces)
    .leftJoin(accountsInstancesWorkspaces, and(eq(workspaces.id, accountsInstancesWorkspaces.workspaceId), isNull(accountsInstancesWorkspaces.deletedAt)))
    .leftJoin(accountsInstances, and(eq(accountsInstancesWorkspaces.accountInstanceId, accountsInstances.id), isNull(accountsInstances.deletedAt)))
    .where(and(...conditions))
    .groupBy(workspaces.id);

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query;
};

exports.getForSelect = async ({ accountId } = {}) => {
  let query = db.select({ label: workspaces.name, value: workspaces.id }).from(workspaces);

  // Si se proporciona accountId, filtrar workspaces por account
  if (accountId) {
    query = query
      .innerJoin(accountsInstancesWorkspaces, and(eq(workspaces.id, accountsInstancesWorkspaces.workspaceId), isNull(accountsInstancesWorkspaces.deletedAt)))
      .innerJoin(
        accountsInstances,
        and(
          eq(accountsInstancesWorkspaces.accountInstanceId, accountsInstances.id),
          eq(accountsInstances.accountId, accountId),
          isNull(accountsInstances.deletedAt)
        )
      );
  }

  return await query.where(and(eq(workspaces.active, true), isNull(workspaces.deletedAt)));
};

exports.count = async (activeOnly = false) => {
  const conditions = [isNull(workspaces.deletedAt)];

  if (activeOnly) {
    conditions.push(eq(workspaces.active, true));
  }

  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(workspaces)
    .where(and(...conditions));

  return result[0].count;
};

exports.findWorkspacesByAccount = async (accountId) => {
  const result = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      active: workspaces.active,
      deletedAt: workspaces.deletedAt,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      associationId: accountsInstancesWorkspaces.id,
      associationActive: accountsInstancesWorkspaces.active,
      instanceName: instances.name,
      instanceUrl: instances.baseUrl,
    })
    .from(workspaces)
    .innerJoin(accountsInstancesWorkspaces, and(eq(workspaces.id, accountsInstancesWorkspaces.workspaceId), isNull(accountsInstancesWorkspaces.deletedAt)))
    .innerJoin(accountsInstances, and(eq(accountsInstancesWorkspaces.accountInstanceId, accountsInstances.id), eq(accountsInstances.accountId, accountId)))
    .innerJoin(instances, eq(accountsInstances.instanceId, instances.id))
    .where(isNull(workspaces.deletedAt));

  return result;
};

exports.findWorkspacesByUser = async (userId) => {
  const result = await db
    .selectDistinct({
      id: workspaces.id,
      name: workspaces.name,
      active: workspaces.active,
      deletedAt: workspaces.deletedAt,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      userWorkspaceId: usersWorkspaces.id,
      userWorkspaceActive: usersWorkspaces.active,
    })
    .from(workspaces)
    .innerJoin(usersWorkspaces, and(eq(workspaces.id, usersWorkspaces.workspaceId), isNull(usersWorkspaces.deletedAt)))
    .where(and(eq(usersWorkspaces.userId, userId), isNull(workspaces.deletedAt), eq(workspaces.active, true)));

  return result;
};

exports.updateWorkspace = async (id, data) => {
  try {
    return await db
      .update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, id));
  } catch (error) {
    handleDbError(error, "Failed to update workspace");
  }
};

exports.softDelete = async (id) => {
  try {
    return await db.update(workspaces).set({ active: false, deletedAt: new Date() }).where(eq(workspaces.id, id));
  } catch (error) {
    handleDbError(error, "Failed to deactivate workspace");
  }
};

exports.activate = async (id) => {
  try {
    return await db.update(workspaces).set({ active: true, updatedAt: new Date() }).where(eq(workspaces.id, id));
  } catch (error) {
    handleDbError(error, "Failed to activate workspace");
  }
};

exports.assignWorkspaceToAccountInstance = async (accountInstanceId, workspaceId) => {
  const existing = await db
    .select({
      id: accountsInstancesWorkspaces.id,
    })
    .from(accountsInstancesWorkspaces)
    .where(and(eq(accountsInstancesWorkspaces.accountInstanceId, accountInstanceId), eq(accountsInstancesWorkspaces.workspaceId, workspaceId)))
    .limit(1);

  if (existing.length > 0) {
    try {
      return await db
        .update(accountsInstancesWorkspaces)
        .set({ active: true, deletedAt: null, updatedAt: new Date() })
        .where(eq(accountsInstancesWorkspaces.id, existing[0].id));
    } catch (error) {
      handleDbError(error, "Failed to reactivate workspace-accountInstance relation");
    }
  }

  try {
    const result = await db.insert(accountsInstancesWorkspaces).values({
      accountInstanceId,
      workspaceId,
      active: true,
    });
    return result[0];
  } catch (error) {
    handleDbError(error, "Failed to assign workspace to accountInstance");
  }
};

exports.removeWorkspaceFromAccountInstance = async (accountInstanceId, workspaceId) => {
  try {
    return await db
      .update(accountsInstancesWorkspaces)
      .set({ active: false, deletedAt: new Date() })
      .where(and(eq(accountsInstancesWorkspaces.accountInstanceId, accountInstanceId), eq(accountsInstancesWorkspaces.workspaceId, workspaceId)));
  } catch (error) {
    handleDbError(error, "Failed to remove workspace from accountInstance");
  }
};

exports.assignWorkspaceToUser = async (userId, workspaceId) => {
  try {
    const result = await db.insert(usersWorkspaces).values({
      userId,
      workspaceId,
      active: true,
    });
    return result[0];
  } catch (error) {
    handleDbError(error, "Failed to assign workspace to user");
  }
};

exports.removeWorkspaceFromUser = async (userId, workspaceId) => {
  try {
    return await db
      .update(usersWorkspaces)
      .set({ active: false, deletedAt: new Date() })
      .where(and(eq(usersWorkspaces.userId, userId), eq(usersWorkspaces.workspaceId, workspaceId)));
  } catch (error) {
    handleDbError(error, "Failed to remove workspace from user");
  }
};

exports.deactivate = async (id) => {
  try {
    return await db.update(workspaces).set({ active: false, updatedAt: new Date() }).where(eq(workspaces.id, id));
  } catch (error) {
    handleDbError(error, "Failed to deactivate workspace");
  }
};

exports.getWorkspaceAccountIds = async (workspaceId) => {
  const result = await db
    .selectDistinct({
      accountId: accountsInstances.accountId,
    })
    .from(accountsInstancesWorkspaces)
    .innerJoin(
      accountsInstances,
      and(eq(accountsInstancesWorkspaces.accountInstanceId, accountsInstances.id), isNull(accountsInstances.deletedAt))
    )
    .where(and(eq(accountsInstancesWorkspaces.workspaceId, workspaceId), isNull(accountsInstancesWorkspaces.deletedAt)));

  return result.map((row) => row.accountId);
};

module.exports = exports;
