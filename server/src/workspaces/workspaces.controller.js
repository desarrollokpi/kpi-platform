const workspacesServices = require("./workspaces.services");

exports.readWorkspacesByAdmin = async (req, res) => {
  try {
    const workspaces = await workspacesServices.readWorkspacesByAdmin(req.userId);

    res.send(workspaces);
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.readWorkspacesByUser = async (req, res) => {
  const { userId, adminId } = req;

  try {
    const workspaces = await workspacesServices.readWorkspacesByUser(userId, adminId);

    res.send(workspaces);
  } catch (error) {
    return res.status(400).send(error.stack);
  }
};
