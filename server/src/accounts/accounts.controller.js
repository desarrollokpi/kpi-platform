const accountsServices = require("./accounts.services");

exports.createAccount = async (req, res, next) => {
  try {
    const { name, subDomain, dataBase, keyUser, password, logoAddress } = req.body;

    const account = await accountsServices.createAccount({
      name,
      subDomain,
      dataBase,
      keyUser,
      password,
      logoAddress,
    });

    res.status(201).json({
      message: "Cuenta creada exitosamente",
      account,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get requesting user to check tenant isolation
    const usersRepository = require("../users/users.repository");
    const rolesRepository = require("../roles/roles.repository");
    const { ROLE_NAMES } = require("../constants/roles");

    const requestingUser = await usersRepository.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Check if user is tenant admin trying to access another account
    const isRootAdmin = await rolesRepository.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
    if (!isRootAdmin && requestingUser.accountId !== parseInt(id, 10)) {
      return res.status(403).json({
        error: "No tienes permisos para acceder a esta cuenta",
      });
    }

    const account = await accountsServices.getAccountById(parseInt(id));

    res.json({ account });
  } catch (error) {
    next(error);
  }
};

exports.getAccountStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await accountsServices.getAccountWithStats(parseInt(id));

    res.json({ account });
  } catch (error) {
    next(error);
  }
};

exports.getAccountInstances = async (req, res, next) => {
  try {
    const { id } = req.params;
    const account = await accountsServices.getAccountWithInstances(parseInt(id));
    res.json({ account });
  } catch (error) {
    next(error);
  }
};

exports.getAccountWorkspaces = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await accountsServices.getAccountWithWorkspaces(parseInt(id));

    res.json({ account });
  } catch (error) {
    next(error);
  }
};

exports.getAllAccounts = async (req, res, next) => {
  try {
    const { active, limit, offset, listed = "false", mode } = req.query;

    const isSelectMode = mode === "select" || listed === "true";

    if (isSelectMode) {
      const list = await accountsServices.getAccountsForSelect();
      return res.json(list);
    }

    const options = {};
    if (active !== undefined) options.active = active === "true";
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    const accounts = await accountsServices.getAllAccounts(options);

    const totalCount = limit || offset ? await accountsServices.getAccountCount(active === "true") : accounts.length;

    res.json({ accounts, count: accounts.length, totalCount });
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, subDomain, dataBase, keyUser, password, logoAddress } = req.body;

    const account = await accountsServices.updateAccount(parseInt(id), {
      name,
      subDomain,
      dataBase,
      keyUser,
      password,
      logoAddress,
    });

    res.json({
      message: "Cuenta actualizada exitosamente",
      account,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { logoAddress } = req.body;

    const account = await accountsServices.updateLogo(parseInt(id), logoAddress);

    res.json({
      message: "Logo actualizado exitosamente",
      account,
    });
  } catch (error) {
    next(error);
  }
};

exports.activateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await accountsServices.activateAccount(parseInt(id));

    res.json({
      message: "Cuenta activada exitosamente",
      account,
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await accountsServices.deactivateAccount(parseInt(id));

    res.json({
      message: "Cuenta desactivada exitosamente",
      account,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    await accountsServices.deleteAccount(parseInt(id));

    res.json({
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.searchAccounts = async (req, res, next) => {
  try {
    const { q, limit, offset } = req.query;

    const options = {};
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    const accounts = await accountsServices.searchAccounts(q, options);

    res.json({ accounts, count: accounts.length });
  } catch (error) {
    next(error);
  }
};

exports.getAccountCount = async (req, res, next) => {
  try {
    const { active } = req.query;

    const count = await accountsServices.getAccountCount(active === "true");

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

exports.getLogoBySubdomain = async (req, res, next) => {
  try {
    const { subdomain = null } = req.query;

    const logoData = await accountsServices.getLogoBySubdomain(subdomain);

    if (!logoData) {
      return res.status(404).json({
        message: "No se encontró una cuenta con ese subdomain",
      });
    }

    res.json(logoData);
  } catch (error) {
    next(error);
  }
};

exports.assignIntance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { intanceId } = req.body;

    if (!intanceId) {
      return res.status(400).json({
        message: "El intanceId es requerido",
      });
    }

    const result = await accountsServices.assignIntance(parseInt(id), parseInt(intanceId));

    res.status(201).json({
      message: "Intance asignada exitosamente",
      result,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeIntance = async (req, res, next) => {
  try {
    const { id, intanceId } = req.params;

    await accountsServices.removeIntance(parseInt(id), parseInt(intanceId));

    res.json({
      message: "Intance removida exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.getContracts = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contracts = await accountsServices.getContracts(parseInt(id));

    res.json({ contracts, count: contracts.length });
  } catch (error) {
    next(error);
  }
};

exports.createContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, adress } = req.body;

    const contract = await accountsServices.createContract(parseInt(id), {
      nombre,
      adress,
    });

    res.status(201).json({
      message: "Contrato creado exitosamente",
      contract,
    });
  } catch (error) {
    next(error);
  }
};
