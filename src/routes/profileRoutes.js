const express = require('express');
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, changePassword, uploadProfilePicture } = require('../controllers/profileController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);
router.put('/picture', upload.single('profile_picture'), uploadProfilePicture);

module.exports = router;
