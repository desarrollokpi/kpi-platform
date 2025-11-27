const { db } = require("../../database");
const { eq, and, isNull, sql } = require("drizzle-orm");
const { instances, accountsInstances } = require("../db/schema");

exports.createIntance = async (intanceData) => {
  const [result] = await db.insert(instances).values(intanceData);
  return result;
};

exports.findById = async (id) => {
  const result = await db
    .select()
    .from(instances)
    .where(and(eq(instances.id, id), isNull(instances.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findByName = async (name) => {
  const result = await db
    .select()
    .from(instances)
    .where(and(eq(instances.name, name), isNull(instances.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findAll = async (options = {}) => {
  const { active, limit, offset, accountId } = options;

  const conditions = [isNull(instances.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(instances.active, active));
  }

  if (accountId) {
    conditions.push(eq(accountsInstances.accountsId, accountId));
  }

  let query = db
    .select({
      id: instances.id,
      name: instances.name,
      baseUrl: instances.baseUrl,
      apiUserName: instances.apiUserName,
      apiPassword: instances.apiPassword,
      active: instances.active,
      deletedAt: instances.deletedAt,
      createdAt: instances.createdAt,
      updatedAt: instances.updatedAt,
      accountId: sql`MIN(${accountsInstances.accountsId})`.as("accountId"),
    })
    .from(instances)
    .leftJoin(accountsInstances, and(eq(instances.id, accountsInstances.instancesId), isNull(accountsInstances.deletedAt)))
    .where(and(...conditions))
    .groupBy(instances.id);

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query;
};

exports.getForSelect = async ({ accountId = null }) => {
  let conditions = [isNull(instances.deletedAt), eq(instances.active, true)];

  let query = db.select({ label: instances.name, value: instances.id }).from(instances);

  if (accountId) {
    return await query
      .innerJoin(
        accountsInstances,
        and(
          eq(accountsInstances.instancesId, instances.id),
          eq(accountsInstances.accountsId, accountId),
          isNull(accountsInstances.deletedAt),
          eq(accountsInstances.active, true)
        )
      )
      .where(and(...conditions));
  }

  return await query.where(and(...conditions));
};

exports.count = async (activeOnly = false) => {
  const conditions = [isNull(instances.deletedAt)];

  if (activeOnly) {
    conditions.push(eq(instances.active, true));
  }

  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(instances)
    .where(and(...conditions));

  return result[0].count;
};

exports.updateIntance = async (id, data) => {
  return await db
    .update(instances)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(instances.id, id));
};

exports.softDelete = async (id) => {
  return await db.update(instances).set({ active: false, deletedAt: new Date() }).where(eq(instances.id, id));
};

exports.activate = async (id) => {
  return await db.update(instances).set({ active: true, deletedAt: null }).where(eq(instances.id, id));
};

exports.associateAccountIntance = async (accountsId, instancesId) => {
  const [result] = await db.insert(accountsInstances).values({
    accountsId,
    instancesId,
  });
  return result;
};

exports.updateOrCreateAccountInstance = async (instanceId, accountId) => {
  // Buscar si ya existe una relación para esta instancia
  const existing = await db
    .select()
    .from(accountsInstances)
    .where(and(eq(accountsInstances.instancesId, instanceId), isNull(accountsInstances.deletedAt)))
    .limit(1);

  if (existing.length > 0) {
    // Si existe, actualizar el accountId
    return await db.update(accountsInstances).set({ accountsId: accountId, updatedAt: new Date() }).where(eq(accountsInstances.id, existing[0].id));
  } else {
    // Si no existe, crear una nueva relación
    const [result] = await db.insert(accountsInstances).values({
      accountsId: accountId,
      instancesId: instanceId,
      active: true,
    });
    return result;
  }
};

exports.findInstancesByAccount = async (accountsId) => {
  return await db
    .select({
      id: instances.id,
      name: instances.name,
      baseUrl: instances.baseUrl,
      apiUserName: instances.apiUserName,
      active: instances.active,
      createdAt: instances.createdAt,
      associationId: accountsInstances.id,
      associationActive: accountsInstances.active,
    })
    .from(accountsInstances)
    .innerJoin(instances, eq(accountsInstances.instancesId, instances.id))
    .where(and(eq(accountsInstances.accountsId, accountsId), isNull(accountsInstances.deletedAt), isNull(instances.deletedAt)));
};

exports.findAccountsByIntance = async (instancesId) => {
  return await db.execute(sql`
    SELECT a.*, ai.id as association_id, ai.active as association_active
    FROM accounts a
    INNER JOIN accounts_instances ai ON a.id = ai.accounts_id
    WHERE ai.instances_id = ${instancesId}
      AND ai.deleted_at IS NULL
      AND a.deleted_at IS NULL
  `);
};

module.exports = exports;
