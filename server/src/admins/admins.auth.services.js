const adminsRepository = require("./admins.repository");
const adminsRedisRepository = require("./admins.redis.repository");
const AdminsException = require("./admins.exception");
const encrypt = require("../common/encrypt");

exports.compareAdminsIds = async (adminId) => {
  const sessionAdminId = await adminsRedisRepository.getById(adminId);

  return sessionAdminId === adminId;
};

exports.signIn = async (name, password, subdomain) => {
  console.log("name", name);
  console.log("password", password);
  console.log("subdomain", subdomain);
  const admin = await adminsRepository.readByName(name);
  console.log("admin", admin);
  const adminBelongsToSubdomain = admin.subdomain === subdomain;

  if (!admin || !adminBelongsToSubdomain) throw new AdminsException("El usuario no existe");

  const passwordsMatch = await encrypt.compare(password, admin.password);
  const sessionIsActive = await exports.compareAdminsIds(admin.id);

  if (!passwordsMatch) throw new AdminsException("Contraseña no válida");

  if (sessionIsActive) {
    throw new AdminsException(`El usuario ${admin.name} ya está utilizando el sistema, intente con otro usuario o bien contáctelo para que libere la sesión`);
  }

  adminsRedisRepository.addById(admin.id);
  return admin.id;
};

exports.signOut = async (adminId) => {
  await adminsRedisRepository.removeById(adminId);
};

exports.refreshSession = async (adminId) => {
  await adminsRedisRepository.setExpirationById(adminId);
};

exports.timeAvailableInSession = async (adminId) => {
  const timeAvailableInSession = await adminsRedisRepository.getTimeToLiveById(adminId);
  return timeAvailableInSession;
};
