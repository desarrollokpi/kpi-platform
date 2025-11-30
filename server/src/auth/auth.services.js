const authRepository = require("./auth.repository");
const encrypt = require("../common/encrypt");
const signToken = require("../common/signToken");
const { ROLE_NAMES } = require("../constants/roles");
const { UnauthorizedError, ForbiddenError } = require("../common/exception");

const usersRedisRepository = require("./auth.redis.repository");

exports.signIn = async (identifier, password, subdomain = null) => {
  const user = await authRepository.findUserForAuthentication(identifier);

  if (!user) {
    throw new UnauthorizedError("Usuario o contraseña inválidos");
  }

  if (!user.active) {
    throw new ForbiddenError("Usuario inactivo. Contacte al administrador");
  }

  if (subdomain && user.accountId) {
    if (!user.accountSubdomain || user.accountSubdomain !== subdomain) {
      throw new UnauthorizedError("Usuario no autorizado para este tenant");
    }

    if (!user.accountActive) {
      throw new ForbiddenError("La cuenta está inactiva. Contacte al administrador");
    }
  }

  const passwordsMatch = await encrypt.compare(password, user.password);
  if (!passwordsMatch) {
    throw new UnauthorizedError("Usuario o contraseña inválidos");
  }

  await usersRedisRepository.addById(user.id);

  let primaryRole = ROLE_NAMES.USER;
  if (user.roles && user.roles.some((r) => r.name === ROLE_NAMES.ROOT_ADMIN)) {
    primaryRole = ROLE_NAMES.ROOT_ADMIN;
  } else if (user.roles && user.roles.some((r) => r.name === ROLE_NAMES.TENANT_ADMIN)) {
    primaryRole = ROLE_NAMES.TENANT_ADMIN;
  }

  const token = signToken({
    id: user.id,
    role: primaryRole,
    accountId: user.accountId,
    userName: user.userName,
    mail: user.mail,
    name: user.name,
  });

  return {
    user: {
      id: user.id,
      userName: user.userName,
      mail: user.mail,
      name: user.name,
      accountId: user.accountId,
      account: user.accountId
        ? {
            id: user.accountId,
            name: user.accountName,
            subDomain: user.accountSubdomain,
            logoAddress: user.accountLogoAddress,
          }
        : null,
      roles: user.roles ? user.roles.map((r) => r.name) : [],
      primaryRole,
    },
    token,
  };
};

exports.signOut = async (userId) => {
  await usersRedisRepository.removeById(userId);
};

exports.refreshSession = async (userId) => {
  await usersRedisRepository.setExpirationById(userId);
};

exports.validateSession = async (userId) => {
  // A session is considered valid as long as it exists in Redis and has not expired
  const sessionUserId = await usersRedisRepository.getById(userId);
  return sessionUserId === userId;
};

exports.getCurrentUser = async (userId) => {
  const user = await authRepository.getUserSessionInfo(userId);

  if (!user) {
    throw new UnauthorizedError("Usuario no encontrado");
  }

  return {
    id: user.id,
    userName: user.userName,
    mail: user.mail,
    accountId: user.accountId,
    account: user.accountId
      ? {
          id: user.accountId,
          name: user.accountName,
          subDomain: user.accountSubdomain,
          logoAddress: user.accountLogoAddress,
        }
      : null,
    roles: user.roles ? user.roles.map((r) => r.name) : [],
    active: user.active,
  };
};
