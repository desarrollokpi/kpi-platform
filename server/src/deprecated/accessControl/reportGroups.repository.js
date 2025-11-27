/**
 * Report Groups Repository
 * Handles database operations for report groups and their section assignments
 */

const { db } = require('../connection');
const { eq, and, inArray } = require('drizzle-orm');
const {
  reportGroups,
  usersHaveReportGroups,
  users,
} = require('../schema');

/**
 * Get all report groups
 */
exports.getAllReportGroups = async () => {
  return await db.select().from(reportGroups);
};

/**
 * Get report groups by account
 */
exports.getReportGroupsByAccount = async (accountId) => {
  return await db
    .select()
    .from(reportGroups)
    .where(eq(reportGroups.idAccount, accountId));
};

/**
 * Get report group by ID
 */
exports.getReportGroupById = async (id) => {
  const result = await db
    .select()
    .from(reportGroups)
    .where(eq(reportGroups.id, id))
    .limit(1);
  return result[0];
};

/**
 * Get report group by code
 */
exports.getReportGroupByCode = async (code) => {
  const result = await db
    .select()
    .from(reportGroups)
    .where(eq(reportGroups.code, code))
    .limit(1);
  return result[0];
};

/**
 * Create report group
 */
exports.createReportGroup = async (data) => {
  const result = await db.insert(reportGroups).values(data);
  return result[0].insertId;
};

/**
 * Update report group
 */
exports.updateReportGroup = async (id, data) => {
  return await db
    .update(reportGroups)
    .set(data)
    .where(eq(reportGroups.id, id));
};

/**
 * Delete report group
 */
exports.deleteReportGroup = async (id) => {
  // First delete all section assignments
  await exports.removeAllSectionsFromReportGroup(id);

  // Then delete the report group
  return await db
    .delete(reportGroups)
    .where(eq(reportGroups.id, id));
};

/**
 * Deactivate report group (soft delete)
 */
exports.deactivateReportGroup = async (id) => {
  return await db
    .update(reportGroups)
    .set({ active: 0 })
    .where(eq(reportGroups.id, id));
};

/**
 * Get sections assigned to a report group
 */
exports.getSectionsByReportGroup = async (reportGroupId) => {
  const [rows] = await db.execute(
    `
      SELECT
        s.id_section AS idSection,
        s.id_report AS idReport,
        s.name
      FROM report_groups_have_sections r
      INNER JOIN adm_account_sections s
        ON r.id_section = s.id_section
       AND r.id_report = s.id_report
      WHERE r.id_adm_report_groups = ?
    `,
    [reportGroupId],
  );

  return rows;
};

/**
 * Assign section to report group
 */
exports.assignSectionToReportGroup = async (reportGroupId, sectionId, reportId) => {
  await db.execute(
    `
      INSERT INTO report_groups_have_sections
        (id_adm_report_groups, id_section, id_report)
      VALUES (?, ?, ?)
    `,
    [reportGroupId, sectionId, reportId],
  );
};

/**
 * Remove section from report group
 */
exports.removeSectionFromReportGroup = async (reportGroupId, sectionId, reportId) => {
  await db.execute(
    `
      DELETE FROM report_groups_have_sections
      WHERE id_adm_report_groups = ?
        AND id_section = ?
        AND id_report = ?
    `,
    [reportGroupId, sectionId, reportId],
  );
};

/**
 * Bulk assign sections to report group
 * Replaces all existing sections with new ones
 */
exports.replaceSectionsInReportGroup = async (reportGroupId, sections) => {
  // First remove all existing sections
  await exports.removeAllSectionsFromReportGroup(reportGroupId);

  // Then add new sections
  if (sections && sections.length > 0) {
    const valuesClause = sections.map(() => '(?, ?, ?)').join(', ');
    const params = [];

    sections.forEach(section => {
      params.push(reportGroupId, section.idSection, section.idReport);
    });

    await db.execute(
      `
        INSERT INTO report_groups_have_sections
          (id_adm_report_groups, id_section, id_report)
        VALUES ${valuesClause}
      `,
      params,
    );
  }
};

/**
 * Remove all sections from report group
 */
exports.removeAllSectionsFromReportGroup = async (reportGroupId) => {
  await db.execute(
    `
      DELETE FROM report_groups_have_sections
      WHERE id_adm_report_groups = ?
    `,
    [reportGroupId],
  );
};

/**
 * Get users assigned to a report group
 */
exports.getUsersByReportGroup = async (reportGroupId) => {
  return await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      mail: users.mail,
    })
    .from(usersHaveReportGroups)
    .innerJoin(users, eq(usersHaveReportGroups.idUser, users.id))
    .where(eq(usersHaveReportGroups.idReportGroup, reportGroupId));
};

/**
 * Assign user to report group
 */
exports.assignUserToReportGroup = async (userId, reportGroupId) => {
  return await db.insert(usersHaveReportGroups).values({
    idUser: userId,
    idReportGroup: reportGroupId,
  });
};

/**
 * Remove user from report group
 */
exports.removeUserFromReportGroup = async (userId, reportGroupId) => {
  return await db
    .delete(usersHaveReportGroups)
    .where(
      and(
        eq(usersHaveReportGroups.idUser, userId),
        eq(usersHaveReportGroups.idReportGroup, reportGroupId)
      )
    );
};

/**
 * Get report groups for a user
 */
exports.getReportGroupsByUser = async (userId) => {
  return await db
    .select({
      id: reportGroups.id,
      code: reportGroups.code,
      name: reportGroups.name,
      active: reportGroups.active,
    })
    .from(usersHaveReportGroups)
    .innerJoin(reportGroups, eq(usersHaveReportGroups.idReportGroup, reportGroups.id))
    .where(eq(usersHaveReportGroups.idUser, userId));
};

/**
 * Bulk replace user's report groups
 */
exports.replaceUserReportGroups = async (userId, reportGroupIds) => {
  // First remove all existing assignments
  await db
    .delete(usersHaveReportGroups)
    .where(eq(usersHaveReportGroups.idUser, userId));

  // Then add new assignments
  if (reportGroupIds && reportGroupIds.length > 0) {
    const values = reportGroupIds.map(groupId => ({
      idUser: userId,
      idReportGroup: groupId,
    }));
    return await db.insert(usersHaveReportGroups).values(values);
  }
};

/**
 * Get report groups with section count
 * Mimics the complex query from group-reports-page.sql
 */
exports.getReportGroupsWithSectionCount = async (accountId) => {
  const result = await db.execute(`
    SELECT
      gh.id_adm_report_groups as id,
      gh.code,
      gh.name,
      COUNT(gb.id_section) as sectionCount,
      gh.active
    FROM adm_report_groups gh
    LEFT JOIN report_groups_have_sections gb
      ON gh.id_adm_report_groups = gb.id_adm_report_groups
    WHERE gh.id_adm_account = ?
    GROUP BY gh.id_adm_report_groups, gh.code, gh.name, gh.active
    ORDER BY gh.name
  `, [accountId]);

  return result[0];
};
