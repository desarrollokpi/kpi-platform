const adminServices = require("./admins.services");
const workspacesServces = require("../workspaces/workspaces.routes");

exports.readProfile = async (req, res) => {
  try {
    const profile = await adminServices.readProfile(req.userId);

    res.send(profile);
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.readLogo = async (req, res) => {
  try {
    const logo = await adminServices.readLogo(req.userId);

    res.send(logo);
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.readAdminsBySuperuser = async (req, res) => {
  try {
    const admins = await adminServices.readAdminsBySuperuser();

    res.send(admins);
  } catch (error) {
    return res.status(400).send(error.stack);
  }
};

exports.acceptTermsAndConditions = async (req, res) => {
  try {
    await adminServices.acceptTermsAndConditions(req.userId, req.body.termsAndConditionsId);

    const profile = await adminServices.readProfile(req.userId);

    res.send(profile);
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.updateLogo = async (req, res) => {
  try {
    const file = req.files[0];

    await adminServices.updateLogo(file.filename, req.userId);

    const logo = await adminServices.readLogo(req.userId);

    res.send({ message: "Logo actualizado con éxito", logo });
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    await adminServices.changePassword(req.userId, req.body.password);

    res.send({ message: "Password actualizado con éxito" });
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.changeUserPassword = async (req, res) => {
  const { password, userId } = req.body;

  try {
    await adminServices.changeUserPassword(userId, password);

    res.send({ message: "Password actualizado con éxito" });
  } catch (error) {
    return res.status(400).send(error.stack);
  }
};

exports.readLogoBySubdomain = async (req, res) => {
  try {
    const logo = await adminServices.readLogoBySubdomain(req.query.subdomain);

    res.send(logo);
  } catch (error) {
    return res.status(400).send(error);
  }
};
