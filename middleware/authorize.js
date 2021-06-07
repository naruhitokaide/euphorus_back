const jwt = require("jsonwebtoken");
module.exports.SECRET_KEY = "secret key";
module.exports.CURRENT_USER = "";

module.exports.authorize = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token = null;

  // Retrieve token
  if (authorization) {
    // Check if malformed
    if (authorization.split(" ")[0] != "Bearer") {
      res
        .status(401)
        .json({ error: true, message: "Authorization header is malformed" });
      return;
    }
    // If not malformed, stored it
    if (authorization.split(" ").length === 2) {
      token = authorization.split(" ")[1];
    }
  }
  // Verify JWT and check expiration date
  try {
    const decoded = jwt.verify(token, module.exports.SECRET_KEY);

    module.exports.CURRENT_USER = decoded.email;

    if (decoded.exp < Date.now()) {
      res.status(401).json({ error: true, message: "JWT token has expired" });
      return;
    }

    next();
  } catch (e) {
    if (e.message === "jwt must be provided") {
      res.status(401).json({
        error: true,
        message: "Authorization header ('Bearer token') not found",
      });
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    }
  }
};
