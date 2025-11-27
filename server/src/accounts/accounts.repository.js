const { db } = require("../../database");
const { eq, and, isNull, sql } = require("drizzle-orm");
const { accounts, accountContract, users, instances, accountsInstances } = require("../db/schema");

exports.createAccount = async (accountData) => {
  const result = await db.insert(accounts).values({
    name: accountData.name,
    subDomain: accountData.subDomain,
    dataBase: accountData.dataBase || null,
    keyUser: accountData.keyUser || null,
    password: accountData.password || null,
    logoAddress: accountData.logoAddress || null,
    active: true,
  });
  return result[0];
};

exports.findById = async (id) => {
  const result = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), isNull(accounts.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findBySubdomain = async (subDomain) => {
  const result = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.subDomain, subDomain), isNull(accounts.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findAll = async (options = {}) => {
  const { active, limit, offset } = options;

  let conditions = [isNull(accounts.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(accounts.active, active));
  }

  let query = db
    .select()
    .from(accounts)
    .where(and(...conditions));

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query;
};

exports.getForSelect = async () => {
  return await db
    .select({ label: accounts.name, value: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.active, true), isNull(accounts.deletedAt)));
};

exports.getStatistics = async (id) => {
  const result = await db.execute(sql`
    SELECT
      COUNT(DISTINCT u.id) AS userCount,
      COUNT(DISTINCT CASE WHEN u.active = 1 THEN u.id END) AS activeUserCount,
      COUNT(DISTINCT ai.instancesId) AS intanceCount,
      COUNT(DISTINCT aiw.idWorkspaces) AS workspaceCount
    FROM accounts a
    LEFT JOIN users u ON a.id = u.accountsId AND u.deletedAt IS NULL
    LEFT JOIN accountsInstances ai ON a.id = ai.accountsId AND ai.active = 1 AND ai.deletedAt IS NULL
    LEFT JOIN accountsInstancesWorkspaces aiw ON ai.id = aiw.idAccountsInstances AND aiw.active = 1 AND aiw.deletedAt IS NULL
    WHERE a.id = ${id} AND a.deletedAt IS NULL
    GROUP BY a.id
    LIMIT 1
  `);

  if (result[0] && result[0].length > 0) {
    return result[0][0];
  }

  // Return empty stats if account exists but has no data
  return {
    userCount: 0,
    activeUserCount: 0,
    intanceCount: 0,
    workspaceCount: 0,
  };
};

exports.findByIdWithInstances = async (id) => {
  const result = await db.execute(sql`
    SELECT
      a.id,
      a.name,
      a.subDomain,
      a.dataBase,
      a.logoAddress,
      a.active,
      a.createdAt,
      a.updatedAt,
      JSON_ARRAYAGG(
        CASE
          WHEN i.id IS NOT NULL THEN JSON_OBJECT(
            'id', i.id,
            'name', i.name,
            'baseUrl', i.baseUrl,
            'active', ai.active,
            'accountIntanceId', ai.id
          )
          ELSE NULL
        END
      ) AS instances
    FROM accounts a
    LEFT JOIN accountsInstances ai ON a.id = ai.accountsId AND ai.deletedAt IS NULL
    LEFT JOIN instances i ON ai.instancesId = i.id AND i.deletedAt IS NULL
    WHERE a.id = ${id} AND a.deletedAt IS NULL
    GROUP BY a.id
    LIMIT 1
  `);

  if (result[0] && result[0].length > 0) {
    const account = result[0][0];

    // Parse instances JSON
    if (account.instances) {
      try {
        if (typeof account.instances === "string") {
          account.instances = JSON.parse(account.instances).filter((intance) => intance !== null);
        } else if (Array.isArray(account.instances)) {
          account.instances = account.instances.filter((intance) => intance !== null);
        }
      } catch (error) {
        console.error("Error parsing account instances:", error);
        account.instances = [];
      }
    } else {
      account.instances = [];
    }

    return account;
  }

  return null;
};

exports.findByIdWithWorkspaces = async (id) => {
  const result = await db.execute(sql`
    SELECT
      a.id,
      a.name,
      a.subDomain,
      a.logoAddress,
      a.active,
      JSON_ARRAYAGG(
        CASE
          WHEN w.id IS NOT NULL THEN JSON_OBJECT(
            'id', w.id,
            'name', w.name,
            'active', aiw.active,
            'intanceName', i.name
          )
          ELSE NULL
        END
      ) AS workspaces
    FROM accounts a
    LEFT JOIN accountsInstances ai ON a.id = ai.accountsId AND ai.deletedAt IS NULL
    LEFT JOIN accountsInstancesWorkspaces aiw ON ai.id = aiw.idAccountsInstances AND aiw.deletedAt IS NULL
    LEFT JOIN workspaces w ON aiw.idWorkspaces = w.id AND w.deletedAt IS NULL
    LEFT JOIN instances i ON ai.instancesId = i.id
    WHERE a.id = ${id} AND a.deletedAt IS NULL
    GROUP BY a.id
    LIMIT 1
  `);

  if (result[0] && result[0].length > 0) {
    const account = result[0][0];

    // Parse workspaces JSON
    if (account.workspaces) {
      try {
        if (typeof account.workspaces === "string") {
          account.workspaces = JSON.parse(account.workspaces).filter((ws) => ws !== null);
        } else if (Array.isArray(account.workspaces)) {
          account.workspaces = account.workspaces.filter((ws) => ws !== null);
        }
      } catch (error) {
        console.error("Error parsing account workspaces:", error);
        account.workspaces = [];
      }
    } else {
      account.workspaces = [];
    }

    return account;
  }

  return null;
};

exports.updateAccount = async (id, data) => {
  return await db
    .update(accounts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(accounts.id, id));
};

exports.updateLogo = async (id, logoAddress) => {
  return await db.update(accounts).set({ logoAddress, updatedAt: new Date() }).where(eq(accounts.id, id));
};

exports.softDelete = async (id) => {
  return await db.update(accounts).set({ active: false, deletedAt: new Date() }).where(eq(accounts.id, id));
};

exports.activate = async (id) => {
  return await db.update(accounts).set({ active: true, updatedAt: new Date() }).where(eq(accounts.id, id));
};

exports.deactivate = async (id) => {
  return await db.update(accounts).set({ active: false, updatedAt: new Date() }).where(eq(accounts.id, id));
};

exports.subdomainExists = async (subDomain, excludeId = null) => {
  const conditions = [eq(accounts.subDomain, subDomain), isNull(accounts.deletedAt)];

  if (excludeId) {
    conditions.push(sql`${accounts.id} != ${excludeId}`);
  }

  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(accounts)
    .where(and(...conditions));

  return result[0].count > 0;
};

exports.search = async (searchTerm, options = {}) => {
  const { limit = 20, offset = 0 } = options;

  const result = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      subDomain: accounts.subDomain,
      logoAddress: accounts.logoAddress,
      active: accounts.active,
      createdAt: accounts.createdAt,
    })
    .from(accounts)
    .where(and(sql`(${accounts.name} LIKE ${`%${searchTerm}%`} OR ${accounts.subDomain} LIKE ${`%${searchTerm}%`})`, isNull(accounts.deletedAt)))
    .limit(limit)
    .offset(offset);

  return result;
};

exports.count = async (activeOnly = false) => {
  const conditions = [isNull(accounts.deletedAt)];

  if (activeOnly) {
    conditions.push(eq(accounts.active, true));
  }

  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(accounts)
    .where(and(...conditions));

  return result[0].count;
};

exports.assignIntance = async (accountId, intanceId) => {
  const result = await db.insert(accountsInstances).values({
    accountsId: accountId,
    instancesId: intanceId,
    active: true,
  });
  return result[0];
};

exports.removeIntance = async (accountId, intanceId) => {
  return await db
    .update(accountsInstances)
    .set({ active: false, deletedAt: new Date() })
    .where(and(eq(accountsInstances.accountsId, accountId), eq(accountsInstances.instancesId, intanceId)));
};

exports.getContracts = async (accountId) => {
  return await db
    .select()
    .from(accountContract)
    .where(and(eq(accountContract.idAccounts, accountId), isNull(accountContract.deletedAt)));
};

exports.createContract = async (contractData) => {
  const result = await db.insert(accountContract).values(contractData);
  return result[0];
};

module.exports = exports;
