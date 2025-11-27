const { sql } = require("drizzle-orm");
const { mysqlTable, int, varchar, text, boolean, datetime, uniqueIndex, index } = require("drizzle-orm/mysql-core");
const { accounts } = require("./accounts");

/**
 * instances - Instancias de Apache Superset
 * NOTA: mantener nombre "instances" según modelo acordado
 */
const instances = mysqlTable(
  "instances",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    baseUrl: text("baseUrl").notNull(),
    apiUserName: varchar("apiUserName", { length: 255 }).notNull(),
    apiPassword: text("apiPassword").notNull(),
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
  (t) => [uniqueIndex("instancesNameUnique").on(t.name)]
);

/**
 * accountsInstances - Tabla puente accounts <-> instances (M:N)
 * Relaciona tenants con instancias de Superset
 */
const accountsInstances = mysqlTable(
  "accountsInstances",
  {
    id: int("id").autoincrement().primaryKey(),
    accountsId: int("accountsId")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    instancesId: int("instancesId")
      .notNull()
      .references(() => instances.id, { onDelete: "restrict" }),
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
  (t) => [uniqueIndex("aiUnique").on(t.accountsId, t.instancesId), index("aiAccountIdx").on(t.accountsId), index("aiIntanceIdx").on(t.instancesId)]
);

module.exports = { instances, accountsInstances };
