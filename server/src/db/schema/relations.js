const { relations } = require("drizzle-orm");
const { accounts, accountContract } = require("./accounts");
const { users } = require("./users");
const { roles, usersRoles } = require("./roles");
const { instances, accountsInstances } = require("./instances");
const { workspaces, accountsInstancesWorkspaces } = require("./workspaces");
const { reports } = require("./reports");
const { dashboards, usersDashboards } = require("./dashboards");

/**
 * RELACIONES DEL MODELO EER FINAL
 */

// accounts relations
const accountsRelations = relations(accounts, ({ many, one }) => ({
  users: many(users),
  contracts: many(accountContract),
  accountsInstances: many(accountsInstances),
}));

const accountContractRelations = relations(accountContract, ({ one }) => ({
  account: one(accounts, {
    fields: [accountContract.accountId],
    references: [accounts.id],
  }),
}));

// users relations
const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, {
    fields: [users.accountId],
    references: [accounts.id],
  }),
  usersRoles: many(usersRoles),
  usersDashboards: many(usersDashboards),
}));

// roles relations
const rolesRelations = relations(roles, ({ many }) => ({
  usersRoles: many(usersRoles),
}));

const usersRolesRelations = relations(usersRoles, ({ one }) => ({
  user: one(users, {
    fields: [usersRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [usersRoles.roleId],
    references: [roles.id],
  }),
}));

// instances relations
const instancesRelations = relations(instances, ({ many }) => ({
  accountsInstances: many(accountsInstances),
}));

const accountsInstancesRelations = relations(accountsInstances, ({ one, many }) => ({
  account: one(accounts, {
    fields: [accountsInstances.accountId],
    references: [accounts.id],
  }),
  instance: one(instances, {
    fields: [accountsInstances.instanceId],
    references: [instances.id],
  }),
  accountsInstancesWorkspaces: many(accountsInstancesWorkspaces),
}));

// workspaces relations
const workspacesRelations = relations(workspaces, ({ many }) => ({
  accountsInstancesWorkspaces: many(accountsInstancesWorkspaces),
  reports: many(reports),
}));

const accountsInstancesWorkspacesRelations = relations(accountsInstancesWorkspaces, ({ one }) => ({
  accountInstance: one(accountsInstances, {
    fields: [accountsInstancesWorkspaces.accountInstanceId],
    references: [accountsInstances.id],
  }),
  workspace: one(workspaces, {
    fields: [accountsInstancesWorkspaces.workspaceId],
    references: [workspaces.id],
  }),
}));

// reports relations
const reportsRelations = relations(reports, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [reports.workspaceId],
    references: [workspaces.id],
  }),
  dashboards: many(dashboards),
}));

// dashboards relations
const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  report: one(reports, {
    fields: [dashboards.reportId],
    references: [reports.id],
  }),
  usersDashboards: many(usersDashboards),
}));

const usersDashboardsRelations = relations(usersDashboards, ({ one }) => ({
  user: one(users, {
    fields: [usersDashboards.userId],
    references: [users.id],
  }),
  dashboard: one(dashboards, {
    fields: [usersDashboards.dashboardId],
    references: [dashboards.id],
  }),
}));

module.exports = {
  accountsRelations,
  accountContractRelations,
  usersRelations,
  rolesRelations,
  usersRolesRelations,
  instancesRelations,
  accountsInstancesRelations,
  workspacesRelations,
  accountsInstancesWorkspacesRelations,
  reportsRelations,
  dashboardsRelations,
  usersDashboardsRelations,
};
