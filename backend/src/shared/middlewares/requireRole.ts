export { }; // Empty export to force module scope
const User = require("../../database/models/User");

module.exports = function requireRole(allowedRoles: string[]) {
  return async function (req: Req, res: Res, next: Next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.is_active) {
        return res.status(403).json({ message: "User account is inactive" });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }

      req.user.role = user.role;
      req.user.tenant_id = user.tenant_id;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

