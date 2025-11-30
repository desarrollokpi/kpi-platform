const jwt = require("jsonwebtoken");

async function hasToken(req, res, next) {
  const token = req.cookies.t;

  if (!token) {
    return res.status(401).json({
      message: "No autorizado",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.adminId = decoded.adminId;
  } catch (error) {
    // When token is invalid or expired, signal session invalidation with 409
    return res.status(409).json({ message: "Sesión inválida o expirada" });
  }

  next();
}

module.exports = { hasToken };
