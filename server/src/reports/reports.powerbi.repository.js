const { db } = require('../../database');
const { reports } = require('../db/schema');
const { inArray, eq } = require('drizzle-orm');

const mapReport = (row) => ({
  id: row.id,
  workspaceId: row.workspaceId,
  name: row.name,
  active: row.active,
});

exports.readReportsByManyWorkspaces = async (workspaceIds = []) => {
  const ids = Array.from(new Set(workspaceIds.filter(Boolean)));
  if (!ids.length) {
    return [];
  }

  const rows = await db
    .select({
      id: reports.id,
      workspaceId: reports.workspacesId,
      name: reports.name,
      active: reports.active,
    })
    .from(reports)
    .where(inArray(reports.workspacesId, ids));

  return rows.map(mapReport);
};

exports.readReportsByWorkspace = async (workspaceId) => {
  if (!workspaceId) {
    return [];
  }

  const rows = await db
    .select({
      id: reports.id,
      workspaceId: reports.workspacesId,
      name: reports.name,
      active: reports.active,
    })
    .from(reports)
    .where(eq(reports.workspacesId, workspaceId));

  return rows.map(mapReport);
};
