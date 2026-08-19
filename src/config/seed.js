const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { sequelize, User, Role, Permission, Lead } = require('../models');

const permissionsList = [
  'lead.view', 'lead.create', 'lead.edit', 'lead.delete',
  'user.view', 'user.create', 'user.edit', 'user.delete',
  'profile.view', 'profile.edit',
  'role.view', 'role.create', 'role.edit', 'role.delete'
];

const rolesConfig = {
  'Admin': permissionsList,
  'Manager': ['lead.view', 'lead.create', 'lead.edit', 'profile.view', 'profile.edit'],
  'Sales User': ['lead.view', 'lead.create', 'lead.edit', 'profile.view', 'profile.edit'],
  'Viewer': ['lead.view', 'profile.view']
};

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Sync force to reset DB (use with caution!)
    await sequelize.sync({ force: true });
    console.log('Database synced (reset).');

    // Create Permissions
    const permissionMap = {};
    for (const p of permissionsList) {
      const perm = await Permission.create({ name: p });
      permissionMap[p] = perm;
    }
    console.log('Permissions created.');

    // Create Roles and assign Permissions
    const roleMap = {};
    for (const [roleName, perms] of Object.entries(rolesConfig)) {
      const role = await Role.create({ name: roleName });
      roleMap[roleName] = role;
      
      const rolePerms = perms.map(p => permissionMap[p]);
      await role.addPermissions(rolePerms);
    }
    console.log('Roles created and permissions assigned.');

    // Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@crm.com',
      password: passwordHash
    });
    await adminUser.addRole(roleMap['Admin']);

    const managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@crm.com',
      password: passwordHash
    });
    await managerUser.addRole(roleMap['Manager']);

    const salesUser1 = await User.create({
      name: 'Sales User 1',
      email: 'sales1@crm.com',
      password: passwordHash
    });
    await salesUser1.addRole(roleMap['Sales User']);

    const salesUser2 = await User.create({
      name: 'Sales User 2',
      email: 'sales2@crm.com',
      password: passwordHash
    });
    await salesUser2.addRole(roleMap['Sales User']);

    const viewerUser = await User.create({
      name: 'Viewer User',
      email: 'viewer@crm.com',
      password: passwordHash
    });
    await viewerUser.addRole(roleMap['Viewer']);
    console.log('Users created.');

    // Create Leads
    await Lead.create({
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Tech Corp',
      status: 'New',
      created_by: salesUser1.id,
      assigned_user_id: salesUser1.id
    });

    await Lead.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Marketing Inc',
      status: 'Contacted',
      created_by: salesUser2.id,
      assigned_user_id: salesUser2.id
    });

    await Lead.create({
      name: 'Bob Boss',
      company: 'Big Boss LLC',
      status: 'Qualified',
      created_by: managerUser.id,
      assigned_user_id: salesUser1.id
    });

    console.log('Leads created.');
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
