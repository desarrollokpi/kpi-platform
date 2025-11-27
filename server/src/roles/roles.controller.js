const rolesServices = require("./roles.services");
const { ValidationError } = require("../common/exception");

exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await rolesServices.getAllRoles();

    res.json({
      roles,
      count: roles.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRolesForSelect = async (req, res, next) => {
  try {
    const roles = await rolesServices.getRolesForSelect();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

exports.getRoleByName = async (req, res, next) => {
  try {
    const { name } = req.params;

    const role = await rolesServices.getRoleByName(name);

    if (!role) {
      return res.status(404).json({
        error: `Rol "${name}" no encontrado`,
      });
    }

    res.json({ role });
  } catch (error) {
    next(error);
  }
};

exports.getUsersByRole = async (req, res, next) => {
  try {
    const { name } = req.params;

    const users = await rolesServices.getUsersByRole(name);

    res.json({
      roleName: name,
      users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRootAdmins = async (req, res, next) => {
  try {
    const users = await rolesServices.getRootAdmins();

    res.json({
      roleName: "root_admin",
      users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTenantAdmins = async (req, res, next) => {
  try {
    const users = await rolesServices.getTenantAdmins();

    res.json({
      roleName: "tenant_admin",
      users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserRoles = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      throw new ValidationError("ID de usuario inválido");
    }

    const roles = await rolesServices.getUserRoles(parseInt(userId));

    res.json({
      userId: parseInt(userId),
      roles,
      count: roles.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.checkUserHasRole = async (req, res, next) => {
  try {
    const { userId, roleName } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      throw new ValidationError("ID de usuario inválido");
    }

    if (!roleName) {
      throw new ValidationError("Nombre de rol es requerido");
    }

    const hasRole = await rolesServices.userHasRole(parseInt(userId), roleName);

    res.json({
      userId: parseInt(userId),
      roleName,
      hasRole,
    });
  } catch (error) {
    next(error);
  }
};
