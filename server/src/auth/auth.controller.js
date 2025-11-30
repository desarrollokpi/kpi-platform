const authServices = require("./auth.services");
const { ValidationError } = require("../common/exception");

exports.signIn = async (req, res, next) => {
  try {
    const { identifier, password, subdomain } = req.body;

    if (!identifier || !password) {
      throw new ValidationError("Correo electrónico y contraseña son requeridos");
    }

    const { user, token } = await authServices.signIn(identifier, password, subdomain);

    res.cookie("t", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.cookie("r", user.primaryRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.json({
      message: "Inicio de sesión exitoso",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.signOut = async (req, res, next) => {
  try {
    const { userId } = req;
    await authServices.signOut(userId);

    res.clearCookie("t");
    res.clearCookie("r");

    res.json({
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await authServices.getCurrentUser(userId);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.refreshSession = async (req, res, next) => {
  try {
    const { userId } = req;
    await authServices.refreshSession(userId);

    res.json({
      message: "Sesión actualizada",
    });
  } catch (error) {
    next(error);
  }
};

exports.checkStatus = async (req, res, next) => {
  try {
    const { userId } = req;
    const isValid = await authServices.validateSession(userId);
    res.json({
      authenticated: isValid,
      userId: isValid ? userId : null,
    });
  } catch (error) {
    next(error);
  }
};
