const { Lead } = require('../models');

// Helper to check if user has 'Sales User' role
const isSalesUser = (req) => {
  if (!req.user || !req.user.Roles) return false;
  return req.user.Roles.some(r => r.name === 'Sales User');
};

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let whereClause = {};

    const { Op } = require('sequelize');
    // If Sales User, only count leads assigned to them or created by them
    if (isSalesUser(req)) {
      whereClause = {
        [Op.or]: [
          { assigned_user_id: req.user.id },
          { created_by: req.user.id }
        ]
      };
    }

    const totalLeads = await Lead.count({ where: whereClause });
    const newLeads = await Lead.count({ where: { ...whereClause, status: 'New' } });
    const contactedLeads = await Lead.count({ where: { ...whereClause, status: 'Contacted' } });
    const qualifiedLeads = await Lead.count({ where: { ...whereClause, status: 'Qualified' } });
    const convertedLeads = await Lead.count({ where: { ...whereClause, status: 'Converted' } });
    const lostLeads = await Lead.count({ where: { ...whereClause, status: 'Lost' } });

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        convertedLeads,
        lostLeads
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats
};
