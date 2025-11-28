const instancesRepository = require("./instances.repository");
const accountsRepository = require("../accounts/accounts.repository");
const { ValidationError, NotFoundError, ConflictError } = require("../common/exception");
const { createApacheSuperSetClient } = require("../apache-superset/apache-superset.service");

const mapInstanceWithAccounts = async (instance) => {
  if (!instance) return null;

  const rows = await instancesRepository.findAccountsByIntance(instance.id);
  const accountsIds = rows.map((row) => row.id);

  return {
    ...instance,
    accountsIds,
  };
};

exports.createIntance = async (intanceData) => {
  const { name, baseUrl, apiUserName, apiPassword, accountsId = [] } = intanceData;

  if (!name || !baseUrl) {
    throw new ValidationError("El nombre y baseUrl son requeridos");
  }

  const existingIntance = await instancesRepository.findByName(name);

  if (existingIntance) {
    throw new ConflictError(`Ya existe una instancia con el nombre "${name}"`);
  }

  const client = createApacheSuperSetClient({ baseUrl, apiUserName, apiPassword });
  const instanceWorking = await client.testConnection();

  if (instanceWorking) {
    const result = await instancesRepository.createIntance({
      name,
      baseUrl,
      apiUserName: apiUserName || null,
      apiPassword: apiPassword || null,
      active: true,
    });

    const instanceId = result.insertId;

    try {
      for (const accountId of accountsId) {
        if (accountId) {
          const account = await accountsRepository.findById(accountId);
          if (!account) {
            throw new NotFoundError(`Cuenta con id ${accountId} no encontrada`);
          }
          await instancesRepository.associateAccountIntance(account.id, instanceId);
        }
      }
    } catch (error) {
      // Rollback: remove instance and any partial associations
      await instancesRepository.deleteInstanceAndAssociations(instanceId);
      throw error;
    }

    const instance = await instancesRepository.findById(instanceId);
    return await mapInstanceWithAccounts(instance);
  }

  throw new Error("Connection failed");
};

exports.getIntanceById = async (id) => {
  const intance = await instancesRepository.findById(id);

  if (!intance) {
    throw new NotFoundError("Instancia no encontrada");
  }

  return await mapInstanceWithAccounts(intance);
};

exports.getAllInstances = async (options = {}) => {
  const rows = await instancesRepository.findAll(options);

  // Normalize accountsIdsRaw -> accountsIds (array of numbers)
  return rows.map((row) => {
    const { accountsIdsRaw, ...rest } = row;
    const accountsId =
      typeof accountsIdsRaw === "string" && accountsIdsRaw.length > 0
        ? accountsIdsRaw
            .split(",")
            .map((v) => parseInt(v, 10))
            .filter((v) => !Number.isNaN(v))
        : [];

    return {
      ...rest,
      accountsId,
    };
  });
};

exports.getInstancesForSelect = async ({ accountId }) => {
  return await instancesRepository.getForSelect({ accountId });
};

exports.getIntanceCount = async (activeOnly = false) => {
  return await instancesRepository.count(activeOnly);
};

exports.updateIntance = async (id, updateData) => {
  const intance = await instancesRepository.findById(id);

  if (!intance) {
    throw new NotFoundError("Instancia no encontrada");
  }

  if (updateData.name && updateData.name !== intance.name) {
    const existingIntance = await instancesRepository.findByName(updateData.name);
    if (existingIntance) {
      throw new ConflictError(`Ya existe una instancia con el nombre "${updateData.name}"`);
    }
  }

  // Separate accounts associations from instance core data
  const { accountsId, ...instanceData } = updateData;

  const client = createApacheSuperSetClient(instanceData);
  const instanceWorking = await client.testConnection();

  if (instanceWorking) {
    // If accountsId is provided, sync associations
    if (Array.isArray(accountsId)) {
      const desiredIds = [...new Set(accountsId.filter((a) => a))];

      // Validate all accounts exist before changing anything
      for (const accId of desiredIds) {
        const account = await accountsRepository.findById(accId);
        if (!account) {
          throw new NotFoundError(`Cuenta con id ${accId} no encontrada`);
        }
      }

      const currentRelations = await instancesRepository.findAccountInstancesByInstance(id);
      const currentIds = currentRelations.map((rel) => rel.accountsId);

      const toAdd = desiredIds.filter((accId) => !currentIds.includes(accId));
      const toRemove = currentRelations.filter((rel) => !desiredIds.includes(rel.accountsId));

      for (const accId of toAdd) {
        await instancesRepository.associateAccountIntance(accId, id);
      }

      for (const rel of toRemove) {
        await instancesRepository.softDeleteAccountInstance(rel.id);
      }
    }

    // Actualizar los datos de la instancia
    if (Object.keys(instanceData).length > 0) {
      await instancesRepository.updateIntance(id, instanceData);
    }

    const instance = await instancesRepository.findById(id);
    return await mapInstanceWithAccounts(instance);
  }

  throw new Error("Connection failed");
};

exports.deleteIntance = async (id) => {
  const intance = await instancesRepository.findById(id);

  if (!intance) {
    throw new NotFoundError("Instancia no encontrada");
  }

  await instancesRepository.softDelete(id);
};

exports.activateIntance = async (id) => {
  const intance = await instancesRepository.findById(id);

  if (!intance) {
    throw new NotFoundError("Instancia no encontrada");
  }

  await instancesRepository.activate(id);

  const updated = await instancesRepository.findById(id);
  return await mapInstanceWithAccounts(updated);
};

exports.getInstancesByAccount = async (accountId) => {
  return await instancesRepository.findInstancesByAccount(accountId);
};

exports.getAccountsByIntance = async (intanceId) => {
  const intance = await instancesRepository.findById(intanceId);

  if (!intance) {
    throw new NotFoundError("Instancia no encontrada");
  }

  return await instancesRepository.findAccountsByIntance(intanceId);
};
