const { poolConnection } = require("../../../database");
const adminsQueries = require("./admins.queries");

exports.readProfile = async (adminId) => {
  const [rows] = await poolConnection.query(adminsQueries.READ_PROFILE, [adminId]);
  return rows.pop();
};

exports.readSubdomains = async () => {
  const [rows] = await poolConnection.query(adminsQueries.READ_SUBDOMAINS);
  return rows;
};

exports.readAdminsBySuperuser = async () => {
  const [rows] = await poolConnection.query(adminsQueries.READ_ADMINS_BY_SUPERUSER);
  return rows;
};

exports.readByName = async (name) => {
  const [rows] = await poolConnection.query(adminsQueries.READ_BY_NAME, [name]);
  return rows.pop();
};

exports.updateLogo = async (logoAddress, adminId) => {
  await poolConnection.query(adminsQueries.UPDATE_LOGO, [logoAddress, adminId]);
};

exports.acceptTermsAndConditions = async (adminId, termsAndConditionsId) => {
  await poolConnection.query(adminsQueries.ACCEPT_TERMS_AND_CONDITIONS, [adminId, termsAndConditionsId]);
};

exports.updatePassword = async (adminId, newPassword) => {
  await poolConnection.query(adminsQueries.UPDATE_PASSWORD, [newPassword, adminId]);
};

exports.updateUserPassword = async (userId, newPassword) => {
  await poolConnection.query(adminsQueries.UPDATE_USER_PASSWORD, [newPassword, userId]);
};

exports.readLogoBySubdomain = async (subdomain) => {
  const [rows] = await poolConnection.query(adminsQueries.READ_LOGO_BY_SUBDOMAIN, [subdomain]);
  return rows.pop();
};

exports.readAdminTermsAndConditions = async (subdomain) => {
  const [rows] = await poolConnection.query(adminsQueries.READ_ADMIN_TERMS_AND_CONDITIONS, [subdomain]);
  return rows.map((result) => result.id);
};
