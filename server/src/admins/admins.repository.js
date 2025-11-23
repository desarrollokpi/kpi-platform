const connection = require("../../database");
const adminsQueries = require("./admins.queries");

exports.readProfile = async (adminId) => {
  return new Promise((resolve, reject) =>
    connection.query(adminsQueries.READ_PROFILE, [adminId], async (error, rows) => {
      if (error) throw reject(error);

      const user = rows.pop();

      return resolve(user);
    })
  );
};

exports.readSubdomains = async () => {
  return new Promise((resolve, reject) =>
    connection.query(adminsQueries.READ_SUBDOMAINS, [], async (error, rows) => {
      if (error) throw reject(error);

      return resolve(rows);
    })
  );
};

exports.readAdminsBySuperuser = async () => {
  return new Promise((resolve, reject) =>
    connection.query(adminsQueries.READ_ADMINS_BY_SUPERUSER, [], async (error, rows) => {
      if (error) throw reject(error);

      return resolve(rows);
    })
  );
};

exports.readByName = async (name) => {
  return new Promise((resolve, reject) =>
    connection.query(adminsQueries.READ_BY_NAME, [name], async (error, rows) => {
      if (error) throw reject(error);

      const user = rows.pop();

      return resolve(user);
    })
  );
};

exports.updateLogo = async (logoAddress, adminId) => {
  connection.query(adminsQueries.UPDATE_LOGO, [logoAddress, adminId], async (error, rows) => {
    if (error) throw error;
  });
};

exports.acceptTermsAndConditions = async (adminId, termsAndConditionsId) => {
  connection.query(adminsQueries.ACCEPT_TERMS_AND_CONDITIONS, [adminId, termsAndConditionsId], async (error, rows) => {
    if (error) throw error;
  });
};

exports.updatePassword = async (adminId, newPassword) => {
  connection.query(adminsQueries.UPDATE_PASSWORD, [newPassword, adminId], async (error, rows) => {
    if (error) throw error;
  });
};

exports.updateUserPassword = async (userId, newPassword) => {
  connection.query(adminsQueries.UPDATE_USER_PASSWORD, [newPassword, userId], async (error, rows) => {
    if (error) throw error;
  });
};

exports.readLogoBySubdomain = async (subdomain) => {
  return new Promise((resolve, reject) =>
    connection.query(adminsQueries.READ_LOGO_BY_SUBDOMAIN, [subdomain], async (error, rows) => {
      if (error) throw reject(error);

      const user = rows.pop();

      return resolve(user);
    })
  );
};

exports.readAdminTermsAndConditions = async (subdomain) => {
  return new Promise((resolve, reject) =>
    connection.query(adminsQueries.READ_ADMIN_TERMS_AND_CONDITIONS, [subdomain], async (error, results) => {
      if (error) throw reject(error);

      const termsAndConditions = results.map((result) => result.id);

      return resolve(termsAndConditions);
    })
  );
};
