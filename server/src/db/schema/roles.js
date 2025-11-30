const { sql } = require("drizzle-orm");
const { mysqlTable, int, varchar, boolean, datetime, uniqueIndex, index } = require("drizzle-orm/mysql-core");
const { users } = require("./users");

const roles = mysqlTable(
  "roles",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 64 }).notNull(),
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
  (t) => [uniqueIndex("rolesNameUnique").on(t.name)]
);

const usersRoles = mysqlTable(
  "usersRoles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    roleId: int("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
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
  (t) => [uniqueIndex("usersRolesUnique").on(t.userId, t.roleId), index("usersRolesUserIdx").on(t.userId), index("usersRolesRoleIdx").on(t.roleId)]
);

module.exports = { roles, usersRoles };
