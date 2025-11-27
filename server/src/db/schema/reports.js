const { sql } = require("drizzle-orm");
const { mysqlTable, int, varchar, boolean, datetime, index } = require("drizzle-orm/mysql-core");
const { workspaces } = require("./workspaces");

/**
 * reports - Reportes dentro de workspaces
 * Relación: workspaces 1:N reports
 */
const reports = mysqlTable(
  "reports",
  {
    id: int("id").autoincrement().primaryKey(),
    workspacesId: int("workspacesId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 100 }).notNull(),
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
  (t) => [index("reportsWorkspaceIdx").on(t.workspacesId), index("reportsActiveIdx").on(t.active)]
);

module.exports = { reports };
