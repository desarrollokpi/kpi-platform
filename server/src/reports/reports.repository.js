const { db } = require("../../database");
const { eq, and, isNull, sql, inArray } = require("drizzle-orm");
const { reports, workspaces, accountsInstancesWorkspaces, accountsInstances } = require("../db/schema");
const { handleDbError } = require("../common/dbErrorMapper");

exports.createReport = async (reportData) => {
  try {
    const [result] = await db.insert(reports).values(reportData);
    return result;
  } catch (error) {
    handleDbError(error, "Failed to create report");
  }
};

exports.findById = async (id) => {
  const result = await db
    .select()
    .from(reports)
    .where(and(eq(reports.id, id), isNull(reports.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findByIdWithWorkspace = async (id) => {
  const result = await db
    .select({
      id: reports.id,
      workspaceId: reports.workspaceId,
      name: reports.name,
      workspaceName: workspaces.name,
      active: reports.active,
      deletedAt: reports.deletedAt,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .innerJoin(workspaces, and(eq(reports.workspaceId, workspaces.id), isNull(workspaces.deletedAt)))
    .where(and(eq(reports.id, id), isNull(reports.deletedAt)))
    .limit(1);

  return result[0] || null;
};

exports.findAll = async (options = {}) => {
  const { active, limit, offset } = options;

  let conditions = [isNull(reports.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(reports.active, active));
  }

  let query = db
    .select()
    .from(reports)
    .where(and(...conditions));

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query;
};

exports.findAllWithWorkspace = async (options = {}) => {
  const { active, limit, offset, accountId } = options;

  const conditions = [isNull(reports.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(reports.active, active));
  }

  let query = db
    .select({
      id: reports.id,
      workspaceId: reports.workspaceId,
      name: reports.name,
      workspaceName: workspaces.name,
      active: reports.active,
      deletedAt: reports.deletedAt,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .innerJoin(workspaces, and(eq(reports.workspaceId, workspaces.id), isNull(workspaces.deletedAt)));

  if (accountId !== undefined) {
    query = query
      .innerJoin(
        accountsInstancesWorkspaces,
        and(
          eq(accountsInstancesWorkspaces.workspaceId, workspaces.id),
          eq(accountsInstancesWorkspaces.active, true),
          isNull(accountsInstancesWorkspaces.deletedAt)
        )
      )
      .innerJoin(
        accountsInstances,
        and(
          eq(accountsInstances.id, accountsInstancesWorkspaces.accountInstanceId),
          eq(accountsInstances.accountId, accountId),
          eq(accountsInstances.active, true),
          isNull(accountsInstances.deletedAt)
        )
      );
  }

  query = query.where(and(...conditions));

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query;
};

exports.getForSelect = async () => {
  return await db
    .select({ label: reports.name, value: reports.id })
    .from(reports)
    .where(and(eq(reports.active, true), isNull(reports.deletedAt)));
};

exports.count = async (activeOnly = false) => {
  const conditions = [isNull(reports.deletedAt)];

  if (activeOnly) {
    conditions.push(eq(reports.active, true));
  }

  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(reports)
    .where(and(...conditions));

  return result[0].count;
};

exports.countWithWorkspaceAndAccount = async ({ accountId, active } = {}) => {
  if (accountId === undefined) {
    return exports.count(active === true || active === "true");
  }

  const conditions = [isNull(reports.deletedAt)];

  if (active !== undefined) {
    const activeValue = active === true || active === "true";
    conditions.push(eq(reports.active, activeValue));
  }

  const rows = await db
    .select({ id: reports.id })
    .from(reports)
    .innerJoin(workspaces, and(eq(reports.workspaceId, workspaces.id), isNull(workspaces.deletedAt)))
    .innerJoin(
      accountsInstancesWorkspaces,
      and(
        eq(accountsInstancesWorkspaces.workspaceId, workspaces.id),
        eq(accountsInstancesWorkspaces.active, true),
        isNull(accountsInstancesWorkspaces.deletedAt)
      )
    )
    .innerJoin(
      accountsInstances,
      and(
        eq(accountsInstances.id, accountsInstancesWorkspaces.accountInstanceId),
        eq(accountsInstances.accountId, accountId),
        eq(accountsInstances.active, true),
        isNull(accountsInstances.deletedAt)
      )
    )
    .where(and(...conditions));

  return rows.length;
};

exports.findByWorkspace = async (workspaceId) => {
  return await db
    .select()
    .from(reports)
    .where(and(eq(reports.workspaceId, workspaceId), isNull(reports.deletedAt)));
};

exports.updateReport = async (id, data) => {
  try {
    return await db
      .update(reports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reports.id, id));
  } catch (error) {
    handleDbError(error, "Failed to update report");
  }
};

exports.softDelete = async (id) => {
  try {
    return await db.update(reports).set({ active: false, deletedAt: new Date() }).where(eq(reports.id, id));
  } catch (error) {
    handleDbError(error, "Failed to deactivate report");
  }
};

exports.activate = async (id) => {
  try {
    return await db.update(reports).set({ active: true, deletedAt: null, updatedAt: new Date() }).where(eq(reports.id, id));
  } catch (error) {
    handleDbError(error, "Failed to activate report");
  }
};

exports.deactivate = async (id) => {
  try {
    return await db.update(reports).set({ active: false, updatedAt: new Date() }).where(eq(reports.id, id));
  } catch (error) {
    handleDbError(error, "Failed to deactivate report");
  }
};

module.exports = exports;
