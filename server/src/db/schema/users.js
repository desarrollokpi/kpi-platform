const { sql } = require("drizzle-orm");
const { mysqlTable, int, varchar, boolean, datetime, uniqueIndex, index } = require("drizzle-orm/mysql-core");
const { accounts } = require("./accounts");

/**
 * users - Usuarios del sistema
 * accountsId es NULLABLE solo para usuarios con rol root_admin
 */
const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    accountsId: int("accountsId").references(() => accounts.id, { onDelete: "restrict" }),
    userName: varchar("userName", { length: 64 }).notNull(),
    name: varchar("name", { length: 150 }),
    mail: varchar("mail", { length: 100 }).notNull(),
    password: varchar("password", { length: 64 }).notNull(),
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
  (t) => [uniqueIndex("usersUsernameUnique").on(t.userName), uniqueIndex("usersEmailUnique").on(t.mail), index("usersAccountIdx").on(t.accountsId)]
);

module.exports = { users };
