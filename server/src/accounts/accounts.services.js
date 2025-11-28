const accountsRepository = require("./accounts.repository");
const { ValidationError, NotFoundError, ConflictError } = require("../common/exception");
const imageToBase64 = require("image-to-base64");
const publicPath = (file) => `./public/${file}`;

exports.createAccount = async (accountData) => {
  const { name, subDomain, dataBase, keyUser, password, logoAddress } = accountData;

  // Validate required fields
  if (!name || !subDomain) {
    throw new ValidationError("El nombre y subdominio son requeridos");
  }

  // Validate subdomain format (alphanumeric and hyphens only)
  const subdomainRegex = /^[a-z0-9-]+$/;
  if (!subdomainRegex.test(subDomain)) {
    throw new ValidationError("El subdominio solo puede contener letras minúsculas, números y guiones");
  }

  // Check if subdomain already exists
  const existingAccount = await accountsRepository.findBySubdomain(subDomain);
  if (existingAccount) {
    throw new ConflictError(`El subdominio "${subDomain}" ya está en uso`);
  }

  // Create account
  const result = await accountsRepository.createAccount({
    name,
    subDomain,
    dataBase: dataBase || null,
    keyUser: keyUser || null,
    password: password || null,
    logoAddress: logoAddress || null,
  });

  return await accountsRepository.findById(result.insertId);
};

exports.getAccountById = async (id) => {
  const account = await accountsRepository.findById(id);

  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  return account;
};

exports.getAccountBySubdomain = async (subDomain) => {
  const account = await accountsRepository.findBySubdomain(subDomain);

  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  return account;
};

exports.getAccountWithStats = async (id) => {
  const account = await accountsRepository.findById(id);

  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  const stats = await accountsRepository.getStatistics(id);

  return {
    ...account,
    statistics: stats,
  };
};

exports.getAccountWithInstances = async (id) => {
  const account = await accountsRepository.findByIdWithInstances(id);

  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  return account;
};

exports.getAccountWithWorkspaces = async (id) => {
  const account = await accountsRepository.findByIdWithWorkspaces(id);

  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  return account;
};

exports.getAllAccounts = async (options = {}) => {
  try {
    return await accountsRepository.findAll(options);
  } catch (error) {
    return [];
  }
};

exports.getAccountsForSelect = async () => {
  try {
    return await accountsRepository.getForSelect();
  } catch (error) {
    return [];
  }
};

exports.updateAccount = async (id, updateData) => {
  const { name, subDomain, dataBase, keyUser, password, logoAddress } = updateData;

  // Check if account exists
  const existingAccount = await accountsRepository.findById(id);
  if (!existingAccount) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  // If subdomain is being updated, check if new subdomain is available
  if (subDomain && subDomain !== existingAccount.subDomain) {
    const subdomainExists = await accountsRepository.subdomainExists(subDomain, id);
    if (subdomainExists) {
      throw new ConflictError(`El subdominio "${subDomain}" ya está en uso`);
    }
  }

  // Build update object
  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (subDomain !== undefined) dataToUpdate.subDomain = subDomain;
  if (dataBase !== undefined) dataToUpdate.dataBase = dataBase;
  if (keyUser !== undefined) dataToUpdate.keyUser = keyUser;
  if (password !== undefined) dataToUpdate.password = password;
  if (logoAddress !== undefined) dataToUpdate.logoAddress = logoAddress;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ValidationError("No hay datos para actualizar");
  }

  await accountsRepository.updateAccount(id, dataToUpdate);

  return await accountsRepository.findById(id);
};

exports.updateLogo = async (id, logoAddress) => {
  const account = await accountsRepository.findById(id);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  await accountsRepository.updateLogo(id, logoAddress);

  return await accountsRepository.findById(id);
};

exports.activateAccount = async (id) => {
  const account = await accountsRepository.findById(id);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  await accountsRepository.activate(id);

  return await accountsRepository.findById(id);
};

exports.deactivateAccount = async (id) => {
  const account = await accountsRepository.findById(id);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  await accountsRepository.deactivate(id);

  return await accountsRepository.findById(id);
};

exports.deleteAccount = async (id) => {
  const account = await accountsRepository.findById(id);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  await accountsRepository.softDelete(id);
};

exports.searchAccounts = async (searchTerm, options = {}) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new ValidationError("El término de búsqueda debe tener al menos 2 caracteres");
  }

  return await accountsRepository.search(searchTerm.trim(), options);
};

exports.getAccountCount = async (activeOnly = false) => {
  return await accountsRepository.count(activeOnly);
};

exports.getLogoBySubdomain = async (subDomain = null) => {
  const FALLBACK = "fallback-logo.png";

  const toB64 = async (relativePath) => await imageToBase64(publicPath(relativePath));

  if (!subDomain) return await toB64(FALLBACK);

  try {
    const account = await accountsRepository.findBySubdomain(subDomain);

    const logoPath = account?.logoAddress;
    if (!logoPath) return await toB64(FALLBACK);

    return await toB64(logoPath);
  } catch (err) {
    // Optional: log for debugging, but never fail the request
    // console.warn(`getLogoBySubdomain failed for ${subDomain}`, err);
    return await toB64(FALLBACK);
  }
};

exports.assignIntance = async (accountId, intanceId) => {
  const account = await accountsRepository.findById(accountId);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  return await accountsRepository.assignIntance(accountId, intanceId);
};

exports.removeIntance = async (accountId, intanceId) => {
  const account = await accountsRepository.findById(accountId);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  await accountsRepository.removeIntance(accountId, intanceId);
};

exports.getContracts = async (accountId) => {
  const account = await accountsRepository.findById(accountId);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  return await accountsRepository.getContracts(accountId);
};

exports.createContract = async (accountId, contractData) => {
  const account = await accountsRepository.findById(accountId);
  if (!account) {
    throw new NotFoundError("Cuenta no encontrada");
  }

  return await accountsRepository.createContract({
    idAccounts: accountId,
    ...contractData,
  });
};
