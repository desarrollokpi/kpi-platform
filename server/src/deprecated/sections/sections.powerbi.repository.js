const { db } = require('../../database');
const { sections } = require('../db/schema');
const { inArray, eq } = require('drizzle-orm');

const mapSection = (row) => ({
  id: row.idSection,
  sectionId: row.idSection,
  reportId: row.idReport,
  name: row.name,
});

/**
 * Reads sections for a list of reports.
 * @param {Array<{id?: string, reportId?: string}>} reportsList
 */
exports.readSectionsByManyReports = async (reportsList = []) => {
  const reportIds = Array.from(
    new Set(
      reportsList
        .map((report) => report?.id || report?.reportId)
        .filter(Boolean),
    ),
  );

  if (!reportIds.length) {
    return [];
  }

  const rows = await db
    .select({
      idSection: sections.idSection,
      idReport: sections.idReport,
      name: sections.name,
    })
    .from(sections)
    .where(inArray(sections.idReport, reportIds));

  return rows.map(mapSection);
};

exports.readSectionsByReport = async (_workspaceId, reportId) => {
  if (!reportId) {
    return [];
  }

  const rows = await db
    .select({
      idSection: sections.idSection,
      idReport: sections.idReport,
      name: sections.name,
    })
    .from(sections)
    .where(eq(sections.idReport, reportId));

  return rows.map(mapSection);
};
