const usersServices = require("./users.services");
const { ValidationError } = require("../common/exception");
const dashboardsServices = require("../dashboards/dashboards.services");

exports.createUser = async (req, res, next) => {
  try {
    const { username, name, mail, password, accountId, roleId } = req.body;

    // Validate input
    if (!username || !mail || !password) {
      throw new ValidationError("Todos los campos son requeridos: username, name, mail, password, role");
    }

    const user = await usersServices.createUser({
      username,
      name,
      mail,
      password,
      accountId,
      roleId,
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await usersServices.getUserById(parseInt(id));

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.userId; // Set by authentication middleware

    const user = await usersServices.getUserProfile(userId);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { active, accountsId, accountId, limit, offset } = req.query;

    const options = {};
    if (active !== undefined) options.active = active === "true";
    const accountsIdFilter = accountId ?? accountsId;
    if (accountsIdFilter !== undefined) {
      options.accountsId = parseInt(accountsIdFilter);
    }
    if (limit !== undefined) options.limit = parseInt(limit);
    if (offset !== undefined) options.offset = parseInt(offset);

    const result = await usersServices.getAllUsers(options);

    res.json({
      users: result.users,
      totalCount: result.totalCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsersByAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const userId = req.userId;

    const users = await usersServices.getUsersByAccount(parseInt(accountId), userId);

    res.json({ users, count: users.length });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, mail, name, roleId } = req.body;

    const user = await usersServices.updateUser(parseInt(id), {
      username,
      mail,
      name,
      roleId,
    });

    res.json({
      message: "Usuario actualizado exitosamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // If admin is changing another user's password, they don't need current password
    const userId = req.userId;
    const isChangingOwnPassword = parseInt(id) === userId;

    if (isChangingOwnPassword) {
      if (!currentPassword || !newPassword) {
        throw new ValidationError("Contraseña actual y nueva son requeridas");
      }
      await usersServices.changePassword(parseInt(id), currentPassword, newPassword);
    } else {
      // Admin resetting another user's password
      if (!newPassword) {
        throw new ValidationError("Nueva contraseña es requerida");
      }
      await usersServices.resetPassword(parseInt(id), newPassword);
    }

    res.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.changeOwnPassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError("Contraseña actual y nueva son requeridas");
    }

    await usersServices.changePassword(userId, currentPassword, newPassword);

    res.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.assignRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body;

    if (!roleName) {
      throw new ValidationError("El nombre del rol es requerido");
    }

    await usersServices.assignRole(parseInt(id), roleName);

    res.json({
      message: `Rol "${roleName}" asignado exitosamente`,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeRole = async (req, res, next) => {
  try {
    const { id, roleName } = req.params;

    await usersServices.removeRole(parseInt(id), roleName);

    res.json({
      message: `Rol "${roleName}" removido exitosamente`,
    });
  } catch (error) {
    next(error);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await usersServices.activateUser(parseInt(id));

    res.json({
      message: "Usuario activado exitosamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await usersServices.deactivateUser(parseInt(id));

    res.json({
      message: "Usuario desactivado exitosamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await usersServices.deleteUser(parseInt(id));

    res.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.assignDashboardsToUser = async (req, res, next) => {
  try {
    const adminUserId = req.userId;
    if (!adminUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const { dashboardIds } = req.body;

    if (!Array.isArray(dashboardIds)) {
      throw new ValidationError("dashboardIds must be an array");
    }

    const result = await dashboardsServices.bulkAssignDashboardsToUser(parseInt(id), dashboardIds, adminUserId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
