const { sql } = require("drizzle-orm");
const { mysqlTable, int, varchar, text, boolean, datetime, uniqueIndex } = require("drizzle-orm/mysql-core");

/**
 * accounts - Tenants/cuentas del sistema
 */
const accounts = mysqlTable(
  "accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    subDomain: varchar("subDomain", { length: 100 }).notNull(),
    dataBase: varchar("dataBase", { length: 100 }),
    keyUser: varchar("keyUser", { length: 64 }),
    password: varchar("password", { length: 15 }),
    logoAddress: varchar("logoAddress", { length: 150 }),
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
  (t) => [uniqueIndex("accountsSubdomainUnique").on(t.subDomain)]
);

/**
 * accountContract - Contratos por tenant
 */
const accountContract = mysqlTable(
  "accountContract",
  {
    id: int("id").autoincrement().primaryKey(),
    idAccounts: int("idAccounts")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    nombre: varchar("nombre", { length: 100 }),
    adress: varchar("adress", { length: 100 }),
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

module.exports = { accounts, accountContract };
