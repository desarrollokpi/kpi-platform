const usersRepository = require("./users.repository");
const accountsRepository = require("../accounts/accounts.repository");
const rolesRepository = require("../roles/roles.repository");
const permissionsService = require("../common/permissions.service");
const encrypt = require("../common/encrypt");
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require("../common/exception");
const { ROLE_NAMES } = require("../constants/roles");

exports.createUser = async (userData) => {
  const { userName, name, mail, password, accountId, roleId } = userData;

  // Validate input
  if (!userName || !name || !mail || !password || !roleId) {
    throw new ValidationError("Todos los campos son requeridos: userName, name, mail, password, role");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(mail)) {
    throw new ValidationError("Formato de email inválido");
  }

  // Resolve role (by id or default USER)
  let role = null;

  if (roleId) {
    role = await rolesRepository.getRoleById(roleId);
  }

  if (!role) {
    role = await rolesRepository.getRoleByName(ROLE_NAMES.USER);
  }

  let effectiveAccountId = accountId;

  if (effectiveAccountId === "" || effectiveAccountId === undefined) {
    effectiveAccountId = null;
  }

  if (effectiveAccountId !== null) {
    const parsedAccountId = Number.parseInt(effectiveAccountId, 10);

    if (Number.isNaN(parsedAccountId)) {
      throw new ValidationError("accountId inválido");
    }

    effectiveAccountId = parsedAccountId;
  }

  if (role.name === ROLE_NAMES.ROOT_ADMIN) {
    // Root admin must not be tied to an account
    effectiveAccountId = null;
  } else {
    // For non-root roles, accountId is required and must be valid
    if (!effectiveAccountId) {
      throw new ValidationError("Todos los campos son requeridos: userName, email, password, accountId");
    }

    const account = await accountsRepository.findById(effectiveAccountId);
    if (!account) {
      throw new NotFoundError("La cuenta especificada no existe");
    }

    if (!account.active) {
      throw new ValidationError("La cuenta está inactiva");
    }
  }

  // Check if email already exists
  const emailExists = await usersRepository.emailExists(mail);
  if (emailExists) {
    throw new ConflictError(`El email "${mail}" ya está registrado`);
  }

  // Hash password
  const hashedPassword = await encrypt.hash(password);

  // Prepare payload for repository (always include accountId, even when null,
  // so the DB explicitly receives NULL for root_admin users)
  const insertPayload = {
    userName,
    name,
    mail,
    password: hashedPassword,
    accountId: effectiveAccountId,
  };

  // Create user
  const result = await usersRepository.createUser(insertPayload);
  const userId = result.insertId;

  try {
    await permissionsService.validateRoleAssignment(role.name, effectiveAccountId);
  } catch (error) {
    await usersRepository.deleteUser(userId);
    throw error;
  }

  await rolesRepository.assignRoleToUser(userId, role.id);
  // Return created user with roles
  return await usersRepository.findByIdWithRoles(userId);
};

exports.getUserById = async (id) => {
  const user = await usersRepository.findByIdWithRoles(id);

  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  // Remove password from response
  delete user.password;

  return user;
};

exports.getUserProfile = async (id) => {
  const user = await usersRepository.findByIdWithRoles(id);

  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const account = await accountsRepository.findById(user.accountId);

  // Remove password
  delete user.password;

  return {
    ...user,
    account: account
      ? {
          id: account.id,
          name: account.name,
          subdomain: account.subDomain,
          logoPath: account.logoAddress,
        }
      : null,
  };
};

exports.getAllUsers = async (options = {}) => {
  const { active, accountId, limit = 20, offset = 0 } = options;

  const users = await usersRepository.findAll({
    active,
    accountId,
    limit,
    offset,
  });

  const totalCount = await usersRepository.count(active, accountId);

  // Enrich users with roles and remove password
  const usersWithRoles = await Promise.all(
    users.map(async (user) => {
      const userWithRoles = await usersRepository.findByIdWithRoles(user.id);
      if (!userWithRoles) {
        return {
          ...user,
          roles: [],
        };
      }
      const { password, ...userWithoutPassword } = userWithRoles;
      return userWithoutPassword;
    })
  );

  return {
    users: usersWithRoles,
    totalCount,
  };
};

exports.getUsersForSelect = async (options = {}) => {
  const { active = true, accountId } = options;

  return await usersRepository.getForSelect({
    active,
    accountId,
  });
};

exports.getUsersByAccount = async (accountId, requestingUserId) => {
  // Check if requesting user is root admin
  const isRootAdmin = await rolesRepository.userHasRole(requestingUserId, ROLE_NAMES.ROOT_ADMIN);

  // If not root admin, verify they belong to the requested account
  if (!isRootAdmin) {
    const requestingUser = await usersRepository.findById(requestingUserId);
    if (!requestingUser || requestingUser.accountId !== accountId) {
      throw new ForbiddenError("No tienes permiso para acceder a los usuarios de esta cuenta");
    }
  }

  const users = await usersRepository.findByAccountId(accountId);

  // Remove passwords and get roles for each user
  const usersWithRoles = await Promise.all(
    users.map(async (user) => {
      const userWithRoles = await usersRepository.findByIdWithRoles(user.id);
      delete userWithRoles.password;
      return userWithRoles;
    })
  );

  return usersWithRoles;
};

exports.updateUser = async (id, updateData) => {
  const { userName, mail, name, roleId } = updateData;

  // Check if user exists
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const dataToUpdate = {};

  // Update userName if provided (no uniqueness constraint at domain level)
  if (userName && userName !== user.userName) {
    dataToUpdate.userName = userName;
  }

  // Check email uniqueness if being updated
  if (mail && mail !== user.mail) {
    const emailExists = await usersRepository.emailExists(mail, id);
    if (emailExists) {
      throw new ConflictError(`El email "${mail}" ya está registrado`);
    }
    dataToUpdate.mail = mail;
  }

  // Update name if provided
  if (name !== undefined) {
    dataToUpdate.name = name;
  }

  if (Object.keys(dataToUpdate).length > 0) {
    await usersRepository.updateUser(id, dataToUpdate);
  }

  // If a roleId is provided, update the user's role assignment
  if (roleId !== undefined && roleId !== null && roleId !== "") {
    const newRole = await rolesRepository.getRoleById(roleId);
    if (!newRole) {
      throw new NotFoundError("Rol no encontrado");
    }

    // Validate role assignment against business rules
    permissionsService.validateRoleAssignment(newRole.name, user.accountId);

    // Get current roles for the user
    const currentRoles = await rolesRepository.getUserRoles(id);

    // Remove all current roles
    for (const currentRole of currentRoles) {
      await rolesRepository.removeRoleFromUser(id, currentRole.id);
    }

    // Assign the new role
    await rolesRepository.assignRoleToUser(id, newRole.id);
  }

  if (Object.keys(dataToUpdate).length === 0 && (roleId === undefined || roleId === null || roleId === "")) {
    throw new ValidationError("No hay datos para actualizar");
  }

  return await exports.getUserById(id);
};

exports.changePassword = async (id, currentPassword, newPassword) => {
  const user = await usersRepository.findById(id);

  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  // Verify current password
  const passwordsMatch = await encrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) {
    throw new ValidationError("Contraseña actual incorrecta");
  }

  // Hash new password
  const hashedPassword = await encrypt.hash(newPassword);

  // Update password
  await usersRepository.updatePassword(id, hashedPassword);
};

exports.resetPassword = async (id, newPassword) => {
  const user = await usersRepository.findById(id);

  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  // Hash new password
  const hashedPassword = await encrypt.hash(newPassword);

  // Update password
  await usersRepository.updatePassword(id, hashedPassword);
};

exports.assignRole = async (userId, roleName) => {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const role = await rolesRepository.getRoleByName(roleName);
  if (!role) {
    throw new NotFoundError(`Rol "${roleName}" no encontrado`);
  }

  // Check if user already has this role
  const hasRole = await rolesRepository.userHasRole(userId, roleName);
  if (hasRole) {
    throw new ConflictError(`El usuario ya tiene el rol "${roleName}"`);
  }

  // Validate role assignment according to business rules
  // root_admin can only be assigned to users with accountId = NULL
  // tenant_admin/tenant_user must have valid accountId
  permissionsService.validateRoleAssignment(roleName, user.accountId);

  await rolesRepository.assignRoleToUser(userId, role.id);
};

exports.removeRole = async (userId, roleName) => {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const role = await rolesRepository.getRoleByName(roleName);
  if (!role) {
    throw new NotFoundError(`Rol "${roleName}" no encontrado`);
  }

  await rolesRepository.removeRoleFromUser(userId, role.id);
};

exports.activateUser = async (id) => {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  await usersRepository.activate(id);

  return await exports.getUserById(id);
};

exports.deactivateUser = async (id) => {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  await usersRepository.deactivate(id);

  return await exports.getUserById(id);
};

exports.deleteUser = async (id) => {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  await usersRepository.softDelete(id);
};
