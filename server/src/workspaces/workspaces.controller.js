const workspacesServices = require("./workspaces.services");

exports.createWorkspace = async (req, res, next) => {
  try {
    const { name, active, accountId, instanceId } = req.body;

    const workspace = await workspacesServices.createWorkspace({
      name,
      active,
      accountId,
      instanceId,
    });

    res.status(201).json({
      message: "Workspace creado exitosamente",
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

exports.getWorkspaceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get requesting user to check tenant isolation
    const usersRepository = require("../users/users.repository");
    const rolesRepository = require("../roles/roles.repository");
    const workspacesRepository = require("./workspaces.repository");
    const { ROLE_NAMES } = require("../constants/roles");

    const requestingUser = await usersRepository.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const workspace = await workspacesServices.getWorkspaceById(parseInt(id));

    // Check if user is tenant admin trying to access workspace from another account
    const isRootAdmin = await rolesRepository.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
    if (!isRootAdmin && requestingUser.accountId) {
      // Verify workspace belongs to user's account
      const workspaceAccountIds = await workspacesRepository.getWorkspaceAccountIds(parseInt(id));
      const belongsToUserAccount = workspaceAccountIds.some((accId) => accId === requestingUser.accountId);

      if (!belongsToUserAccount) {
        return res.status(403).json({
          error: "No tienes permisos para acceder a este workspace",
        });
      }
    }

    res.json({ workspace });
  } catch (error) {
    next(error);
  }
};

exports.getAllWorkspaces = async (req, res, next) => {
  try {
    const { active, limit, offset, listed = "false", mode, accountId } = req.query;

    const isSelectMode = mode === "select" || listed === "true";

    if (isSelectMode) {
      const list = await workspacesServices.getWorkspacesForSelect({ accountId });
      return res.json(list);
    }

    const options = {};
    if (active !== undefined) options.active = active === "true";
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);
    if (accountId) options.accountId = parseInt(accountId, 10);

    const workspaces = await workspacesServices.getAllWorkspaces(options);

    const totalCount =
      limit || offset
        ? await workspacesServices.getWorkspaceCount({
            active: options.active,
            accountId: options.accountId,
          })
        : workspaces.length;

    res.json({ workspaces, count: workspaces.length, totalCount });
  } catch (error) {
    next(error);
  }
};

exports.updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, accountId, instanceId } = req.body;
    const userId = req.userId;

    // Get requesting user to check tenant isolation
    const usersRepository = require("../users/users.repository");
    const rolesRepository = require("../roles/roles.repository");
    const workspacesRepository = require("./workspaces.repository");
    const { ROLE_NAMES } = require("../constants/roles");

    const requestingUser = await usersRepository.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Check if user is tenant admin trying to access workspace from another account
    const isRootAdmin = await rolesRepository.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
    if (!isRootAdmin && requestingUser.accountId) {
      // Verify workspace belongs to user's account
      const workspaceAccountIds = await workspacesRepository.getWorkspaceAccountIds(parseInt(id));
      const belongsToUserAccount = workspaceAccountIds.some((accId) => accId === requestingUser.accountId);

      if (!belongsToUserAccount) {
        return res.status(403).json({
          error: "No tienes permisos para actualizar este workspace",
        });
      }
    }

    const workspace = await workspacesServices.updateWorkspace(parseInt(id), {
      name,
      accountId,
      instanceId,
    });

    res.json({
      message: "Workspace actualizado exitosamente",
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get requesting user to check tenant isolation
    const usersRepository = require("../users/users.repository");
    const rolesRepository = require("../roles/roles.repository");
    const workspacesRepository = require("./workspaces.repository");
    const { ROLE_NAMES } = require("../constants/roles");

    const requestingUser = await usersRepository.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Check if user is tenant admin trying to access workspace from another account
    const isRootAdmin = await rolesRepository.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
    if (!isRootAdmin && requestingUser.accountId) {
      // Verify workspace belongs to user's account
      const workspaceAccountIds = await workspacesRepository.getWorkspaceAccountIds(parseInt(id));
      const belongsToUserAccount = workspaceAccountIds.some((accId) => accId === requestingUser.accountId);

      if (!belongsToUserAccount) {
        return res.status(403).json({
          error: "No tienes permisos para eliminar este workspace",
        });
      }
    }

    await workspacesServices.deleteWorkspace(parseInt(id));

    res.json({
      message: "Workspace eliminado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.activateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get requesting user to check tenant isolation
    const usersRepository = require("../users/users.repository");
    const rolesRepository = require("../roles/roles.repository");
    const workspacesRepository = require("./workspaces.repository");
    const { ROLE_NAMES } = require("../constants/roles");

    const requestingUser = await usersRepository.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Check if user is tenant admin trying to access workspace from another account
    const isRootAdmin = await rolesRepository.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
    if (!isRootAdmin && requestingUser.accountId) {
      // Verify workspace belongs to user's account
      const workspaceAccountIds = await workspacesRepository.getWorkspaceAccountIds(parseInt(id));
      const belongsToUserAccount = workspaceAccountIds.some((accId) => accId === requestingUser.accountId);

      if (!belongsToUserAccount) {
        return res.status(403).json({
          error: "No tienes permisos para activar este workspace",
        });
      }
    }

    const workspace = await workspacesServices.activateWorkspace(parseInt(id));

    res.json({
      message: "Workspace activado exitosamente",
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const usersRepository = require("../users/users.repository");
    const rolesRepository = require("../roles/roles.repository");
    const workspacesRepository = require("./workspaces.repository");
    const { ROLE_NAMES } = require("../constants/roles");

    const requestingUser = await usersRepository.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isRootAdmin = await rolesRepository.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
    if (!isRootAdmin && requestingUser.accountId) {
      const workspaceAccountIds = await workspacesRepository.getWorkspaceAccountIds(parseInt(id));
      const belongsToUserAccount = workspaceAccountIds.some((accId) => accId === requestingUser.accountId);

      if (!belongsToUserAccount) {
        return res.status(403).json({
          error: "No tienes permisos para desactivar este workspace",
        });
      }
    }

    const workspace = await workspacesServices.deactivateWorkspace(parseInt(id));

    res.json({
      message: "Workspace desactivado exitosamente",
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

exports.getWorkspacesByAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const workspaces = await workspacesServices.getWorkspacesByAccount(parseInt(accountId));

    res.json({ workspaces, count: workspaces.length });
  } catch (error) {
    next(error);
  }
};

exports.getWorkspacesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.userId;

    // Get requesting user to check permissions
    const usersRepository = require("../users/users.repository");
    const rolesRepository = require("../roles/roles.repository");
    const { ROLE_NAMES } = require("../constants/roles");

    const requestingUser = await usersRepository.findById(requestingUserId);
    if (!requestingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Check if user is ROOT_ADMIN or TENANT_ADMIN
    const isRootAdmin = await rolesRepository.userHasRole(requestingUserId, ROLE_NAMES.ROOT_ADMIN);
    const isTenantAdmin = await rolesRepository.userHasRole(requestingUserId, ROLE_NAMES.TENANT_ADMIN);

    // If user is a regular USER (not admin), they can only access their own workspaces
    if (!isRootAdmin && !isTenantAdmin) {
      if (parseInt(userId) !== requestingUserId) {
        return res.status(403).json({
          error: "No tienes permisos para ver los workspaces de otro usuario",
        });
      }
    }

    // If user is TENANT_ADMIN, verify the target user belongs to their account
    if (!isRootAdmin && isTenantAdmin && requestingUser.accountId) {
      const targetUser = await usersRepository.findById(parseInt(userId));
      if (!targetUser) {
        return res.status(404).json({ error: "Usuario objetivo no encontrado" });
      }

      if (targetUser.accountId !== requestingUser.accountId) {
        return res.status(403).json({
          error: "No tienes permisos para ver los workspaces de un usuario de otra cuenta",
        });
      }
    }

    const workspaces = await workspacesServices.getWorkspacesByUser(parseInt(userId));

    res.json({ workspaces, count: workspaces.length });
  } catch (error) {
    next(error);
  }
};

exports.assignWorkspaceToAccountInstance = async (req, res, next) => {
  try {
    const { accountInstanceId } = req.params;
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        message: "El workspaceId es requerido",
      });
    }

    const result = await workspacesServices.assignWorkspaceToAccountInstance(parseInt(accountInstanceId), parseInt(workspaceId));

    res.status(201).json({
      message: "Workspace asignado exitosamente",
      result,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeWorkspaceFromAccountInstance = async (req, res, next) => {
  try {
    const { accountInstanceId, workspaceId } = req.params;

    await workspacesServices.removeWorkspaceFromAccountInstance(parseInt(accountInstanceId), parseInt(workspaceId));

    res.json({
      message: "Workspace removido exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.assignWorkspaceToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        message: "El workspaceId es requerido",
      });
    }

    const result = await workspacesServices.assignWorkspaceToUser(parseInt(userId), parseInt(workspaceId));

    res.status(201).json({
      message: "Workspace asignado al usuario exitosamente",
      result,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeWorkspaceFromUser = async (req, res, next) => {
  try {
    const { userId, workspaceId } = req.params;

    await workspacesServices.removeWorkspaceFromUser(parseInt(userId), parseInt(workspaceId));

    res.json({
      message: "Workspace removido del usuario exitosamente",
    });
  } catch (error) {
    next(error);
  }
};
