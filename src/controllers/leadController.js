const { Op } = require('sequelize');
const { Lead, User } = require('../models');

// Helper to check if user has 'Sales User' role
const isSalesUser = (req) => {
  if (!req.user || !req.user.Roles) return false;
  return req.user.Roles.some(r => r.name === 'Sales User');
};

// @desc    Get all leads (with pagination, filters, sorting)
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    let { page = 1, limit = 20, status, search, assignedUserId, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;

    let conditions = [];

    if (status) {
      conditions.push({ status });
    }

    if (assignedUserId) {
      conditions.push({ assigned_user_id: assignedUserId });
    }

    if (search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { company: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    // Role-based data restriction: If Sales User, only see assigned leads or created leads
    console.log('DEBUG_ISSALESUSER:', isSalesUser(req));
    console.log('DEBUG_USER_ROLES:', req.user.Roles ? req.user.Roles.map(r => r.name) : 'none');
    if (isSalesUser(req)) {
      conditions.push({
        [Op.or]: [
          { assigned_user_id: req.user.id },
          { created_by: req.user.id }
        ]
      });
    }

    const whereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};

    const { count, rows } = await Lead.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      },
      debug: {
        isSalesUser: isSalesUser(req),
        roles: req.user.Roles ? req.user.Roles.map(r => r.name) : 'none',
        conditions: conditions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, assigned_user_id } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source,
      status: status || 'New',
      assigned_user_id,
      created_by: req.user.id
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    let lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Sales User constraint: Can edit ONLY their own leads
    if (isSalesUser(req) && lead.assigned_user_id !== req.user.id && lead.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own leads' });
    }

    const { name, email, phone, company, source, status, assigned_user_id } = req.body;

    lead.name = name || lead.name;
    lead.email = email !== undefined ? email : lead.email;
    lead.phone = phone !== undefined ? phone : lead.phone;
    lead.company = company !== undefined ? company : lead.company;
    lead.source = source !== undefined ? source : lead.source;
    lead.status = status || lead.status;
    lead.assigned_user_id = assigned_user_id !== undefined ? assigned_user_id : lead.assigned_user_id;

    await lead.save();

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Extra check, usually only Admin/Manager have lead.delete, but just in case
    if (isSalesUser(req) && lead.assigned_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own leads' });
    }

    await lead.destroy();
    res.status(200).json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Change lead status
// @route   PATCH /api/leads/:id/status
// @access  Private
const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (isSalesUser(req) && lead.assigned_user_id !== req.user.id && lead.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own leads' });
    }

    lead.status = status;
    await lead.save();

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Assign lead
// @route   PATCH /api/leads/:id/assign
// @access  Private
const assignLead = async (req, res) => {
  try {
    const { assigned_user_id } = req.body;
    let lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (isSalesUser(req) && lead.assigned_user_id !== req.user.id && lead.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own leads' });
    }

    lead.assigned_user_id = assigned_user_id;
    await lead.save();

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  assignLead
};
