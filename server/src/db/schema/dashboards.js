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
    supersetId: int("supersetId").notNull(),
    embeddedId: varchar("embeddedId", { length: 64 }),
    name: varchar("name", { length: 100 }).notNull(),
    reportsId: int("reportsId")
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
  (t) => [index("dashboardsReportIdx").on(t.reportsId), index("dashboardsActiveIdx").on(t.active), index("dashboardsSupersetIdx").on(t.supersetId)]
);

/**
 * usersDashboards - Tabla puente users <-> dashboards (M:N)
 * Permisos finales: qué dashboards puede ver cada usuario
 */
const usersDashboards = mysqlTable(
  "usersDashboards",
  {
    id: int("id").autoincrement().primaryKey(),
    idUsers: int("idUsers")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    dashboardsId: int("dashboardsId")
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
    index("udUserIdx").on(t.idUsers),
    index("udDashboardIdx").on(t.dashboardsId),
    index("udActiveIdx").on(t.active),
    // Índice compuesto para lookups de permisos
    index("udUserActiveIdx").on(t.idUsers, t.active),
  ]
);

module.exports = { dashboards, usersDashboards };
