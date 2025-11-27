const { db } = require("../../database");
const { eq, and, isNull, sql } = require("drizzle-orm");
const { reports } = require("../db/schema");

exports.createReport = async (reportData) => {
  const [result] = await db.insert(reports).values(reportData);
  return result;
};

exports.findById = async (id) => {
  const result = await db
    .select()
    .from(reports)
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

exports.findByWorkspace = async (workspaceId) => {
  return await db
    .select()
    .from(reports)
    .where(and(eq(reports.workspacesId, workspaceId), isNull(reports.deletedAt)));
};

exports.updateReport = async (id, data) => {
  return await db
    .update(reports)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(reports.id, id));
};

exports.softDelete = async (id) => {
  return await db.update(reports).set({ active: false, deletedAt: new Date() }).where(eq(reports.id, id));
};

exports.activate = async (id) => {
  return await db.update(reports).set({ active: true, deletedAt: null, updatedAt: new Date() }).where(eq(reports.id, id));
};

module.exports = exports;
