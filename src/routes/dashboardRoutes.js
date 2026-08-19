const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getDashboardStats);

module.exports = router;
