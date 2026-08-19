const { Role, Permission } = require('../models');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin)
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, through: { attributes: [] } }]
    });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create role
// @route   POST /api/roles
// @access  Private (Admin)
const createRole = async (req, res) => {
  try {
    const { name, permissionIds } = req.body;

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ success: false, message: 'Role already exists' });
    }

    const role = await Role.create({ name });

    if (permissionIds && permissionIds.length > 0) {
      await role.setPermissions(permissionIds);
    }

    const createdRole = await Role.findByPk(role.id, {
      include: [{ model: Permission, through: { attributes: [] } }]
    });

    res.status(201).json({ success: true, data: createdRole });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
const updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    let role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    role.name = name || role.name;
    await role.save();

    const updatedRole = await Role.findByPk(role.id, {
      include: [{ model: Permission, through: { attributes: [] } }]
    });

    res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    await role.destroy();
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update role permissions
// @route   PATCH /api/roles/:id/permissions
// @access  Private (Admin)
const updateRolePermissions = async (req, res) => {
  try {
    const { permissionIds } = req.body;
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    await role.setPermissions(permissionIds);

    const updatedRole = await Role.findByPk(role.id, {
      include: [{ model: Permission, through: { attributes: [] } }]
    });

    res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all permissions
// @route   GET /api/roles/permissions
// @access  Private (Admin)
const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getPermissions
};
