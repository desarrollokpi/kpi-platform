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
    idAccountsInstances: int("idAccountsInstances").notNull(),
    idWorkspaces: int("idWorkspaces").notNull(),
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
      columns: [t.idAccountsInstances],
      foreignColumns: [accountsInstances.id],
      name: "aiwAiFK",
    }).onDelete("restrict"),

    foreignKey({
      columns: [t.idWorkspaces],
      foreignColumns: [workspaces.id],
      name: "aiwWsFK",
    }).onDelete("restrict"),

    uniqueIndex("aiwUnique").on(t.idAccountsInstances, t.idWorkspaces),
    index("aiwAiIdx").on(t.idAccountsInstances),
    index("aiwWorkspaceIdx").on(t.idWorkspaces),
    index("aiwActiveIdx").on(t.active),
  ]
);

module.exports = { workspaces, accountsInstancesWorkspaces };
