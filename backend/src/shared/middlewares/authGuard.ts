const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/env");

module.exports = function (req: Req, res: Res, next: Next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
