const { sql } = require("drizzle-orm");
const { mysqlTable, int, varchar, boolean, datetime, uniqueIndex, index, foreignKey } = require("drizzle-orm/mysql-core");
const { accountsInstances } = require("./instances");

/**
 * workspaces - Espacios de trabajo para organizar dashboards
 */
const workspaces = mysqlTable(
  "workspaces",
  {
    id: int("id").autoincrement().primaryKey(),
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
  (t) => []
);

/**
 * accountsInstancesWorkspaces - Tabla puente accountsInstances <-> workspaces
 * Habilita workspaces para un tenant dentro de una instancia específica
 * Relación: accounts-workspaces es N:N PASANDO por accountsInstances
 */
const accountsInstancesWorkspaces = mysqlTable(
  "accountsInstancesWorkspaces",
  {
    id: int("id").autoincrement().primaryKey(),
    accountInstanceId: int("accountInstanceId").notNull(),
    workspaceId: int("workspaceId").notNull(),
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
    foreignKey({
      columns: [t.accountInstanceId],
      foreignColumns: [accountsInstances.id],
      name: "aiwAiFK",
    }).onDelete("restrict"),

    foreignKey({
      columns: [t.workspaceId],
      foreignColumns: [workspaces.id],
      name: "aiwWsFK",
    }).onDelete("restrict"),

    uniqueIndex("aiwUnique").on(t.accountInstanceId, t.workspaceId),
    index("aiwAiIdx").on(t.accountInstanceId),
    index("aiwWorkspaceIdx").on(t.workspaceId),
    index("aiwActiveIdx").on(t.active),
  ]
);

module.exports = { workspaces, accountsInstancesWorkspaces };
