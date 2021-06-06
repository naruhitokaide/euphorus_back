const jwt = require("jsonwebtoken");
module.exports.SECRET_KEY = "secret key";
module.exports.CURRENT_USER = "";

module.exports.authorize = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token = null;

  // Retrieve token
  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
  } else {
    res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found",
    });
    return;
  }

  // Verify JWT and check expiration date
  try {
    const decoded = jwt.verify(token, module.exports.SECRET_KEY);

    module.exports.CURRENT_USER = decoded.email;

    if (decoded.exp < Date.now()) {
      res.status(401).json({ error: true, message: "JWT token has expired" });
      return;
    }

    // Permit user to advance to route
    next();
  } catch (e) {
    res.status(401).json({ error: true, message: "Invalid JWT token" });
  }
};
