const express = require('express');
const router = express.Router();
const { getQTasks, createQTask } = require('../controllers/qtaskController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getQTasks);
router.post('/', authMiddleware, createQTask);

module.exports = router;