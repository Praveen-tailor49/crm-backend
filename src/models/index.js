const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const Lead = require('./Lead');

// User <-> Role (Many-to-Many)
User.belongsToMany(Role, { through: 'user_roles', foreignKey: 'user_id', otherKey: 'role_id' });
Role.belongsToMany(User, { through: 'user_roles', foreignKey: 'role_id', otherKey: 'user_id' });

// Role <-> Permission (Many-to-Many)
Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id', otherKey: 'role_id' });

// User -> Lead (Assigned to)
User.hasMany(Lead, { foreignKey: 'assigned_user_id', as: 'assignedLeads' });
Lead.belongsTo(User, { foreignKey: 'assigned_user_id', as: 'assignedUser' });

// User -> Lead (Created by)
User.hasMany(Lead, { foreignKey: 'created_by', as: 'createdLeads' });
Lead.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  Lead
};
