const express = require('express');
const { login, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateLogin } = require('../validators/authValidator');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
