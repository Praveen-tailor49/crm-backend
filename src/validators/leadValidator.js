const { check, validationResult } = require('express-validator');

exports.validateCreateLead = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').optional({ checkFalsy: true }).isEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
