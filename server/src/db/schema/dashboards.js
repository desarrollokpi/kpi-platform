const { sql } = require("drizzle-orm");
const { mysqlTable, int, varchar, boolean, datetime, index } = require("drizzle-orm/mysql-core");
const { reports } = require("./reports");
const { users } = require("./users");

/**
 * dashboards - Dashboards reales de Apache Superset
 * Relación: reports 1:N dashboards
 */
const dashboards = mysqlTable(
  "dashboards",
  {
    id: int("id").autoincrement().primaryKey(),
    instanceId: int("instanceId").notNull(),
    // Superset dashboard id inside the instance (used to reconstruct apacheId in UI)
    supersetDashboardId: int("supersetDashboardId"),
    embeddedId: varchar("embeddedId", { length: 64 }),
    name: varchar("name", { length: 100 }).notNull(),
    reportId: int("reportId")
      .notNull()
      .references(() => reports.id, { onDelete: "restrict" }),
    active: boolean("active").notNull().default(true),
    deletedAt: datetime("deletedAt"),
    createdAt: datetime("createdAt")
      .notNull()
      .default(sql`now()`),
    updatedAt: datetime("updatedAt")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
  (t) => [index("dashboardsReportIdx").on(t.reportId), index("dashboardsActiveIdx").on(t.active), index("dashboardsInstanceIdx").on(t.instanceId)]
);

/**
 * usersDashboards - Tabla puente users <-> dashboards (M:N)
 * Permisos finales: qué dashboards puede ver cada usuario
 */
const usersDashboards = mysqlTable(
  "usersDashboards",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    dashboardId: int("dashboardId")
      .notNull()
      .references(() => dashboards.id, { onDelete: "restrict" }),
    active: boolean("active").notNull().default(true),
    deletedAt: datetime("deletedAt"),
    createdAt: datetime("createdAt")
      .notNull()
      .default(sql`now()`),
    updatedAt: datetime("updatedAt")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("udUserIdx").on(t.userId),
    index("udDashboardIdx").on(t.dashboardId),
    index("udActiveIdx").on(t.active),
    // Composite index for permission lookups
    index("udUserActiveIdx").on(t.userId, t.active),
  ]
);

module.exports = { dashboards, usersDashboards };
