const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      let hasPermission = false;

      // Check all roles and their permissions for the required permission
      if (req.user.Roles) {
        for (const role of req.user.Roles) {
          if (role.Permissions) {
            for (const permission of role.Permissions) {
              if (permission.name === requiredPermission) {
                hasPermission = true;
                break;
              }
            }
          }
          if (hasPermission) break;
        }
      }

      if (!hasPermission) {
        return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
      }

      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      res.status(500).json({ success: false, message: 'Server Error during permission check' });
    }
  };
};

module.exports = { requirePermission };
