const express = require('express');
const router = express.Router();
const { googleLogin, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/google-login', googleLogin);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;