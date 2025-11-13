const express = require('express');
const router = express.Router();
const { getTasks, createTask, getTaskById, updateTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getTasks);
router.post('/', authMiddleware, createTask);
router.get('/:id', authMiddleware, getTaskById);
router.put('/:id', authMiddleware, updateTask);

module.exports = router;
