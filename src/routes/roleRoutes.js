const express = require('express');
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getPermissions
} = require('../controllers/roleController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

const router = express.Router();

router.use(authenticate);

// Special route for getting raw permissions
router.get('/permissions', requirePermission('role.view'), getPermissions);

router.get('/', requirePermission('role.view'), getRoles);
router.post('/', requirePermission('role.create'), createRole);
router.put('/:id', requirePermission('role.edit'), updateRole);
router.delete('/:id', requirePermission('role.delete'), deleteRole);
router.patch('/:id/permissions', requirePermission('role.edit'), updateRolePermissions);

module.exports = router;
