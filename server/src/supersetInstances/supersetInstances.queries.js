/**
 * Superset Instances Queries
 * SQL queries for Superset instance management
 */

// READ queries
exports.GET_ALL_SUPERSET_INSTANCES = `
  SELECT
    id,
    name,
    base_url as baseUrl,
    active,
    created_at as createdAt,
    updated_at as updatedAt
  FROM superset_instances
  ORDER BY id ASC
`;

exports.GET_ACTIVE_SUPERSET_INSTANCES = `
  SELECT
    id,
    name,
    base_url as baseUrl,
    active,
    created_at as createdAt,
    updated_at as updatedAt
  FROM superset_instances
  WHERE active = 1
  ORDER BY id ASC
`;

exports.GET_SUPERSET_INSTANCE_BY_ID = `
  SELECT
    id,
    name,
    base_url as baseUrl,
    active,
    created_at as createdAt,
    updated_at as updatedAt
  FROM superset_instances
  WHERE id = ?
  LIMIT 1
`;

exports.CHECK_INSTANCE_HAS_WORKSPACES = `
  SELECT COUNT(*) as count
  FROM adm_workspaces
  WHERE superset_instance_id = ?
    AND active = 1
`;

// CREATE queries
exports.CREATE_SUPERSET_INSTANCE = `
  INSERT INTO superset_instances (name, base_url, active)
  VALUES (?, ?, ?)
`;

// UPDATE queries
exports.UPDATE_SUPERSET_INSTANCE = `
  UPDATE superset_instances
  SET
    name = ?,
    base_url = ?,
    active = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`;

exports.DEACTIVATE_SUPERSET_INSTANCE = `
  UPDATE superset_instances
  SET
    active = 0,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`;

// User and Report Access queries (for guest token generation)
exports.GET_USER_WITH_ACCOUNT = `
  SELECT
    u.id,
    u.username,
    u.name,
    u.mail,
    u.active,
    u.id_adm_accounts as accountsId,
    a.name as accountName
  FROM adm_users u
  INNER JOIN adm_accounts a ON u.id_adm_accounts = a.id
  WHERE u.id = ?
  LIMIT 1
`;

exports.CHECK_USER_REPORT_ACCESS = `
  SELECT COUNT(*) as hasAccess
  FROM users_reports ur
  WHERE ur.user_id = ?
    AND ur.report_id = ?
    AND ur.active = 1
`;

exports.GET_REPORT_BY_ID = `
  SELECT
    id,
    id_workspace as workspacesId,
    name,
    active
  FROM adm_account_reports
  WHERE id_report = ?
  LIMIT 1
`;

exports.GET_WORKSPACE_FOR_REPORT = `
  SELECT
    w.id,
    w.name,
    w.superset_instance_id as supersetInstanceId,
    w.active
  FROM adm_workspaces w
  INNER JOIN adm_account_reports r ON r.id_workspace = w.id
  WHERE r.id_report = ?
  LIMIT 1
`;
