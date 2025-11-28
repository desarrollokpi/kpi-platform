const repository = require("./roles.repository");
const { ROLE_NAMES, ROLE_NAMES_LABELS } = require("../constants/roles");

exports.getAllRoles = async () => {
  return await repository.getAllRoles();
};

exports.getRolesForSelect = async () => {
  let roles = await repository.getRolesForSelect();
  for (const role of roles) {
    role.labelRaw = role.label;
    role.label = ROLE_NAMES_LABELS[role.label];
  }
  return roles;
};

exports.getRoleByName = async (name) => {
  return await repository.getRoleByName(name);
};

exports.assignRoleToUser = async (userId, roleName) => {
  const role = await repository.getRoleByName(roleName);
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  // Check if user already has this role
  const hasRole = await repository.userHasRole(userId, roleName);
  if (hasRole) {
    return { message: "User already has this role" };
  }

  return await repository.assignRoleToUser(userId, role.id);
};

exports.removeRoleFromUser = async (userId, roleName) => {
  const role = await repository.getRoleByName(roleName);
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  return await repository.removeRoleFromUser(userId, role.id);
};

exports.getUserRoles = async (userId) => {
  return await repository.getUserRoles(userId);
};

exports.userHasRole = async (userId, roleName) => {
  return await repository.userHasRole(userId, roleName);
};

exports.isRootAdmin = async (userId) => {
  return await repository.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
};

exports.isTenantAdmin = async (userId) => {
  return await repository.userHasRole(userId, ROLE_NAMES.TENANT_ADMIN);
};

exports.isRegularUser = async (userId) => {
  return await repository.userHasRole(userId, ROLE_NAMES.USER);
};

exports.getUsersByRole = async (roleName) => {
  return await repository.getUsersByRole(roleName);
};

exports.getRootAdmins = async () => {
  return await repository.getUsersByRole(ROLE_NAMES.ROOT_ADMIN);
};

exports.getTenantAdmins = async () => {
  return await repository.getUsersByRole(ROLE_NAMES.TENANT_ADMIN);
};

module.exports.ROLE_NAMES = ROLE_NAMES;
