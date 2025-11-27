const usersRepository = require("./users.repository");
const accountsRepository = require("../accounts/accounts.repository");
const rolesRepository = require("../roles/roles.repository");
const permissionsService = require("../common/permissions.service");
const encrypt = require("../common/encrypt");
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require("../common/exception");
const { ROLE_NAMES } = require("../constants/roles");

exports.createUser = async (userData) => {
  const { username, name, mail, password, accountId, roleId } = userData;

  // Validate required fields
  if (!username || !mail || !password) {
    throw new ValidationError("Todos los campos son requeridos: username, email, password");
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

  // Determine effective accountId based on role
  let effectiveAccountId = accountId ?? null;

  if (role.name === ROLE_NAMES.ROOT_ADMIN) {
    // Root admin must not be tied to an account
    effectiveAccountId = null;
  } else {
    // For non-root roles, accountId is required and must be valid
    if (!effectiveAccountId) {
      throw new ValidationError("Todos los campos son requeridos: username, email, password, accountId");
    }

    const account = await accountsRepository.findById(effectiveAccountId);
    if (!account) {
      throw new NotFoundError("La cuenta especificada no existe");
    }

    if (!account.active) {
      throw new ValidationError("La cuenta está inactiva");
    }
  }

  // Check if username already exists
  const usernameExists = await usersRepository.usernameExists(username);
  if (usernameExists) {
    throw new ConflictError(`El nombre de usuario "${username}" ya está en uso`);
  }

  // Check if email already exists
  const emailExists = await usersRepository.emailExists(mail);
  if (emailExists) {
    throw new ConflictError(`El email "${mail}" ya está registrado`);
  }

  // Hash password
  const hashedPassword = await encrypt.hash(password);

  // Create user
  const result = await usersRepository.createUser({
    username,
    name,
    mail,
    password: hashedPassword,
    accountId: effectiveAccountId,
  });

  const userId = result.insertId;

  try {
    permissionsService.validateRoleAssignment(role.name, effectiveAccountId);
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

  const account = await accountsRepository.findById(user.accountsId);

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
  const { active, accountsId, limit = 20, offset = 0 } = options;

  const users = await usersRepository.findAll({
    active,
    accountsId,
    limit,
    offset,
  });

  const totalCount = await usersRepository.count(active, accountsId);

  // Remove passwords from all users
  const sanitizedUsers = users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  return {
    users: sanitizedUsers,
    totalCount,
  };
};

exports.getUsersByAccount = async (accountId, requestingUserId) => {
  // Check if requesting user is root admin
  const isRootAdmin = await rolesRepository.userHasRole(requestingUserId, ROLE_NAMES.ROOT_ADMIN);

  // If not root admin, verify they belong to the requested account
  if (!isRootAdmin) {
    const requestingUser = await usersRepository.findById(requestingUserId);
    if (!requestingUser || requestingUser.accountsId !== accountId) {
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
  const { username, mail, name } = updateData;

  // Check if user exists
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const dataToUpdate = {};

  // Check username uniqueness if being updated
  if (username && username !== user.userName) {
    const usernameExists = await usersRepository.usernameExists(username, id);
    if (usernameExists) {
      throw new ConflictError(`El nombre de usuario "${username}" ya está en uso`);
    }
    dataToUpdate.username = username;
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

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ValidationError("No hay datos para actualizar");
  }

  await usersRepository.updateUser(id, dataToUpdate);

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
  // root_admin can only be assigned to users with accountsId = NULL
  // tenant_admin/tenant_user must have valid accountsId
  permissionsService.validateRoleAssignment(roleName, user.accountsId);

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
