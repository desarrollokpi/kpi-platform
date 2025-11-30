const workspacesRepository = require("./workspaces.repository");
const { ValidationError, NotFoundError, ConflictError } = require("../common/exception");

exports.createWorkspace = async (workspaceData) => {
  const { name, active, accountId, instanceId } = workspaceData;

  if (!name) {
    throw new ValidationError("El nombre es requerido");
  }

  if (!accountId) {
    throw new ValidationError("Para crear un Workspace es necesario asociarlo a una cuenta");
  }

  if (!instanceId) {
    throw new ValidationError("Para crear un Workspace es necesario asociarlo a una instancia");
  }

  // Verificar que el account existe
  const accountsRepository = require("../accounts/accounts.repository");
  const account = await accountsRepository.findById(accountId);
  if (!account) {
    throw new NotFoundError("Account no encontrado");
  }

  // Verificar que la instance existe
  const instancesRepository = require("../instances/instances.repository");
  const instance = await instancesRepository.findById(instanceId);
  if (!instance) {
    throw new NotFoundError("Instance no encontrada");
  }

  // Obtener o verificar que existe accountsInstances
  const accountInstance = await workspacesRepository.findAccountInstance(accountId, instanceId);
  if (!accountInstance) {
    throw new NotFoundError("No existe una relación entre el account y la instance. Debe crear la relación accountsInstances primero.");
  }

  // Crear el workspace
  const result = await workspacesRepository.createWorkspace({
    name,
    active: active !== undefined ? active : true,
  });

  const workspace = await workspacesRepository.findById(result.insertId);

  // Crear la relación en accountsInstancesWorkspaces
  await workspacesRepository.assignWorkspaceToAccountInstance(accountInstance.id, workspace.id);

  return workspace;
};

exports.getWorkspaceById = async (id) => {
  const workspace = await workspacesRepository.findById(id);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  return workspace;
};

exports.getAllWorkspaces = async (options = {}) => {
  return await workspacesRepository.findAll(options);
};

exports.getWorkspacesForSelect = async ({ accountId }) => {
  return await workspacesRepository.getForSelect({ accountId });
};

exports.getWorkspaceCount = async (options = {}) => {
  const { active, accountId } = options;
  const rows = await workspacesRepository.findAll({ active, accountId });
  return rows.length;
};

exports.updateWorkspace = async (id, updateData) => {
  const { name, active, accountId, instanceId } = updateData;

  const workspace = await workspacesRepository.findById(id);
  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  if (!name) {
    throw new ValidationError("El nombre es requerido");
  }

  if (!accountId) {
    throw new ValidationError("Para actualizar un Workspace es necesario asociarlo a una cuenta");
  }

  if (!instanceId) {
    throw new ValidationError("Para actualizar un Workspace es necesario asociarlo a una instancia");
  }

  const accountsRepository = require("../accounts/accounts.repository");
  const account = await accountsRepository.findById(accountId);
  if (!account) {
    throw new NotFoundError("Account no encontrado");
  }

  const instancesRepository = require("../instances/instances.repository");
  const instance = await instancesRepository.findById(instanceId);
  if (!instance) {
    throw new NotFoundError("Instance no encontrada");
  }

  const accountInstance = await workspacesRepository.findAccountInstance(accountId, instanceId);
  if (!accountInstance) {
    throw new NotFoundError(
      "No existe una relación entre el account y la instance. Debe crear la relación accountsInstances primero."
    );
  }

  await workspacesRepository.updateWorkspace(id, {
    name,
    active: active !== undefined ? active : workspace.active,
  });

  try {
    await workspacesRepository.assignWorkspaceToAccountInstance(accountInstance.id, id);
  } catch (error) {
    // Si ya existe la relación (clave única), ignorar el error
    if (!(error && error.code === "ER_DUP_ENTRY")) {
      throw error;
    }
  }

  return await workspacesRepository.findById(id);
};

exports.deleteWorkspace = async (id) => {
  const workspace = await workspacesRepository.findById(id);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  await workspacesRepository.softDelete(id);
};

exports.activateWorkspace = async (id) => {
  const workspace = await workspacesRepository.findById(id);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  await workspacesRepository.activate(id);

  return await workspacesRepository.findById(id);
};

exports.deactivateWorkspace = async (id) => {
  const workspace = await workspacesRepository.findById(id);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  await workspacesRepository.deactivate(id);

  return await workspacesRepository.findById(id);
};

exports.getWorkspacesByAccount = async (accountId) => {
  return await workspacesRepository.findWorkspacesByAccount(accountId);
};

exports.getWorkspacesByUser = async (userId) => {
  return await workspacesRepository.findWorkspacesByUser(userId);
};

exports.assignWorkspaceToAccountInstance = async (accountInstanceId, workspaceId) => {
  const workspace = await workspacesRepository.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  const result = await workspacesRepository.assignWorkspaceToAccountInstance(accountInstanceId, workspaceId);

  return result;
};

exports.removeWorkspaceFromAccountInstance = async (accountInstanceId, workspaceId) => {
  await workspacesRepository.removeWorkspaceFromAccountInstance(accountInstanceId, workspaceId);
};

exports.assignWorkspaceToUser = async (userId, workspaceId) => {
  const workspace = await workspacesRepository.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  const result = await workspacesRepository.assignWorkspaceToUser(userId, workspaceId);

  return result;
};

exports.removeWorkspaceFromUser = async (userId, workspaceId) => {
  await workspacesRepository.removeWorkspaceFromUser(userId, workspaceId);
};
