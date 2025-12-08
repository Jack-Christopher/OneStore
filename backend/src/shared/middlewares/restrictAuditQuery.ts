export { }; // Empty export to force module scope

const User = require("../../database/models/User");

module.exports = async function restrictAuditQuery(req: Req, res: Res, next: Next) {
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

    // Set user role and tenant_id in request
    req.user.role = user.role;
    req.user.tenant_id = user.tenant_id;

    // Apply restrictions based on role
    if (user.role === "admin") {
      // Admin: no restrictions, can access all logs
      // Don't force any filters
    } else if (user.role === "manager") {
      // Manager: must filter by tenant_id
      req.query.tenant_id = user.tenant_id;
    } else if (user.role === "clerk") {
      // Clerk: must filter by tenant_id and user_id
      req.query.tenant_id = user.tenant_id;
      req.query.user_id = user._id.toString();
    } else {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

