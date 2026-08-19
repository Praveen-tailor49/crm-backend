const express = require('express');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  assignLead
} = require('../controllers/leadController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validateCreateLead } = require('../validators/leadValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission('lead.view'), getLeads);
router.post('/', requirePermission('lead.create'), validateCreateLead, createLead);
router.get('/:id', requirePermission('lead.view'), getLead);
router.put('/:id', requirePermission('lead.edit'), updateLead);
router.delete('/:id', requirePermission('lead.delete'), deleteLead);
router.patch('/:id/status', requirePermission('lead.edit'), updateLeadStatus);
router.patch('/:id/assign', requirePermission('lead.edit'), assignLead);

module.exports = router;
