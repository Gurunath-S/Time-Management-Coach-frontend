const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile } = require('../controllers/authController');

router.get('/', authMiddleware, getUserProfile);

module.exports = router;
