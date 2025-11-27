const instancesRepository = require("./instances.repository");
const { ValidationError, NotFoundError, ConflictError } = require("../common/exception");

exports.createIntance = async (intanceData) => {
  const { name, baseUrl, apiUserName, apiPassword, accountId = null } = intanceData;

  if (!name || !baseUrl) {
    throw new ValidationError("El nombre y baseUrl son requeridos");
  }

  const existingIntance = await instancesRepository.findByName(name);
  if (existingIntance) {
    throw new ConflictError(`Ya existe una instancia con el nombre "${name}"`);
  }

  const result = await instancesRepository.createIntance({
    name,
    baseUrl,
    apiUserName: apiUserName || null,
    apiPassword: apiPassword || null,
    active: true,
  });

  if (accountId) {
    await instancesRepository.associateAccountIntance(accountId, result.insertId);
  }

  return await instancesRepository.findById(result.insertId);
};

exports.getIntanceById = async (id) => {
  const intance = await instancesRepository.findById(id);

  if (!intance) {
    throw new NotFoundError("Instancia no encontrada");
  }

  return intance;
};

exports.getAllInstances = async (options = {}) => {
  return await instancesRepository.findAll(options);
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

  // Separar accountId de updateData ya que no se actualiza directamente en instances
  const { accountId, ...instanceData } = updateData;

  // Actualizar los datos de la instancia
  if (Object.keys(instanceData).length > 0) {
    await instancesRepository.updateIntance(id, instanceData);
  }

  // Si se proporciona accountId, actualizar la relación en accountsInstances
  if (accountId !== undefined) {
    // Verificar que la cuenta existe
    const accountsRepository = require("../accounts/accounts.repository");
    const account = await accountsRepository.findById(accountId);
    if (!account) {
      throw new NotFoundError("Cuenta no encontrada");
    }

    // Actualizar o crear la relación en accountsInstances
    await instancesRepository.updateOrCreateAccountInstance(id, accountId);
  }

  return await instancesRepository.findById(id);
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

  return await instancesRepository.findById(id);
};

exports.getInstancesByAccount = async (accountId) => {
  return await instancesRepository.findInstancesByAccount(accountId);
};

exports.getAccountsByIntance = async (intanceId) => {
  const intance = await instancesRepository.findById(intanceId);

  if (!intance) {
    throw new NotFoundError("Instancia no encontrada");
  }

  const result = await instancesRepository.findAccountsByIntance(intanceId);
  return result[0] || [];
};
