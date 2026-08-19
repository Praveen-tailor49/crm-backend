const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRoles
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validateCreateUser } = require('../validators/userValidator');

const router = express.Router();

router.use(authenticate);
router.use(requirePermission('user.view')); // Base check, specific endpoints can override

router.get('/', getUsers);
router.post('/', requirePermission('user.create'), validateCreateUser, createUser);
router.get('/:id', requirePermission('user.view'), getUser);
router.put('/:id', requirePermission('user.edit'), updateUser);
router.delete('/:id', requirePermission('user.delete'), deleteUser);
router.patch('/:id/roles', requirePermission('user.edit'), updateUserRoles);

module.exports = router;
