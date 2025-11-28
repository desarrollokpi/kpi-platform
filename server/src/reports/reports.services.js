const reportsRepository = require("./reports.repository");
const workspacesRepository = require("../workspaces/workspaces.repository");
const { ValidationError, NotFoundError, ConflictError } = require("../common/exception");
const { db } = require("../../database");
const {
  reports: reportsTable,
  workspaces: workspacesTable,
  accountsInstancesWorkspaces,
  accountsInstances,
} = require("../db/schema");
const { and, eq, isNull } = require("drizzle-orm");

exports.createReport = async (reportData) => {
  const { workspacesId, name } = reportData;

  if (!workspacesId || !name) {
    throw new ValidationError("El workspacesId y el nombre son requeridos");
  }

  // Verify workspace exists
  const workspace = await workspacesRepository.findById(workspacesId);
  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  // Check if report with same name already exists in this workspace
  const reports = await reportsRepository.findByWorkspace(workspacesId);
  const existingReport = reports.find((r) => r.name === name);

  if (existingReport) {
    throw new ConflictError(`Ya existe un reporte con el nombre "${name}" en este workspace`);
  }

  const result = await reportsRepository.createReport({
    workspacesId,
    name,
    active: reportData.active !== undefined ? reportData.active : true,
  });

  return await reportsRepository.findById(result.insertId);
};

exports.getReportById = async (id) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  return report;
};

exports.getAllReports = async (options = {}) => {
  const { accountId, active, limit, offset } = options;

  // If accountId is provided, filter reports by tenant via workspace associations
  if (accountId !== undefined) {
    const conditions = [isNull(reportsTable.deletedAt)];

    if (active !== undefined) {
      conditions.push(eq(reportsTable.active, active === true || active === "true"));
    }

    let query = db
      .select({
        id: reportsTable.id,
        workspacesId: reportsTable.workspacesId,
        name: reportsTable.name,
        workspaceName: workspacesTable.name,
        active: reportsTable.active,
        deletedAt: reportsTable.deletedAt,
        createdAt: reportsTable.createdAt,
        updatedAt: reportsTable.updatedAt,
      })
      .from(reportsTable)
      .innerJoin(
        workspacesTable,
        and(eq(reportsTable.workspacesId, workspacesTable.id), isNull(workspacesTable.deletedAt))
      )
      .innerJoin(
        accountsInstancesWorkspaces,
        and(
          eq(accountsInstancesWorkspaces.idWorkspaces, workspacesTable.id),
          eq(accountsInstancesWorkspaces.active, true),
          isNull(accountsInstancesWorkspaces.deletedAt)
        )
      )
      .innerJoin(
        accountsInstances,
        and(
          eq(accountsInstances.id, accountsInstancesWorkspaces.idAccountsInstances),
          eq(accountsInstances.accountsId, accountId),
          eq(accountsInstances.active, true),
          isNull(accountsInstances.deletedAt)
        )
      )
      .where(and(...conditions));

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    return await query;
  }

  // No account filter: global list (used by root admin)
  const globalReports = await reportsRepository.findAll(options);

  // Enrich with workspaceName for root admin view
  const workspaceIds = [...new Set(globalReports.map((r) => r.workspacesId).filter(Boolean))];
  let workspacesMap = new Map();

  if (workspaceIds.length > 0) {
    const { workspaces } = require("../db/schema");
    const { inArray } = require("drizzle-orm");

    const rows = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(inArray(workspaces.id, workspaceIds));

    workspacesMap = new Map(rows.map((w) => [w.id, w.name]));
  }

  return globalReports.map((r) => ({
    ...r,
    workspaceName: workspacesMap.get(r.workspacesId) || null,
  }));
};

exports.getReportsForSelect = async () => {
  return await reportsRepository.getForSelect();
};

exports.getReportCount = async (options = {}) => {
  const { accountId, active } = options;

  if (accountId !== undefined) {
    const conditions = [isNull(reportsTable.deletedAt)];

    if (active !== undefined) {
      conditions.push(eq(reportsTable.active, active === true || active === "true"));
    }

    const rows = await db
      .select({ id: reportsTable.id })
      .from(reportsTable)
      .innerJoin(
        workspacesTable,
        and(eq(reportsTable.workspacesId, workspacesTable.id), isNull(workspacesTable.deletedAt))
      )
      .innerJoin(
        accountsInstancesWorkspaces,
        and(
          eq(accountsInstancesWorkspaces.idWorkspaces, workspacesTable.id),
          eq(accountsInstancesWorkspaces.active, true),
          isNull(accountsInstancesWorkspaces.deletedAt)
        )
      )
      .innerJoin(
        accountsInstances,
        and(
          eq(accountsInstances.id, accountsInstancesWorkspaces.idAccountsInstances),
          eq(accountsInstances.accountsId, accountId),
          eq(accountsInstances.active, true),
          isNull(accountsInstances.deletedAt)
        )
      )
      .where(and(...conditions));

    return rows.length;
  }

  return await reportsRepository.count(active === true || active === "true");
};

exports.updateReport = async (id, updateData) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  // If updating workspace, verify it exists
  if (updateData.workspacesId && updateData.workspacesId !== report.workspacesId) {
    const workspace = await workspacesRepository.findById(updateData.workspacesId);
    if (!workspace) {
      throw new NotFoundError("Workspace no encontrado");
    }
  }

  // If updating name, check for duplicates in the workspace
  if (updateData.name && updateData.name !== report.name) {
    const targetWorkspaceId = updateData.workspacesId || report.workspacesId;
    const reports = await reportsRepository.findByWorkspace(targetWorkspaceId);
    const existingReport = reports.find((r) => r.name === updateData.name && r.id !== id);

    if (existingReport) {
      throw new ConflictError(`Ya existe un reporte con el nombre "${updateData.name}" en este workspace`);
    }
  }

  await reportsRepository.updateReport(id, updateData);

  return await reportsRepository.findById(id);
};

exports.deleteReport = async (id) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  await reportsRepository.softDelete(id);
};

exports.activateReport = async (id) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  await reportsRepository.activate(id);

  return await reportsRepository.findById(id);
};

exports.getReportsByWorkspace = async (workspaceId) => {
  const workspace = await workspacesRepository.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  return await reportsRepository.findByWorkspace(workspaceId);
};
