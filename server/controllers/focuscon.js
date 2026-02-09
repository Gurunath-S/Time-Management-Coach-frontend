const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.saveFocusSession = async (req, res) => {
  const { startTime, endTime, completedTasks, taskChanges } = req.body;

  if (!startTime || !endTime || !completedTasks || !Array.isArray(completedTasks)) {
    return res.status(400).json({ message: 'Invalid input. Required: startTime, endTime, completedTasks[]' });
  }

  try {
    const timeSpent = Math.floor((new Date(endTime) - new Date(startTime)) / 1000); // in seconds

    const session = await prisma.focusSession.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timeSpent,
        completedTasks,
        taskChanges: taskChanges || [],
        userId: Number(req.userId),
      }
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error saving focus session:', error);
    res.status(500).json({ message: 'Failed to save focus session' });
  }
};

exports.getFocusSessions = async (req, res) => {
  try {
    // Limit to recent 20 sessions for faster loading
    const limit = parseInt(req.query.limit) || 20;
    const sessions = await prisma.focusSession.findMany({
      where: { userId: Number(req.userId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    res.status(500).json({ message: 'Failed to fetch focus sessions' });
  }
};

// Log task changes during focus mode (stored in memory until session ends)
let pendingTaskChanges = new Map(); // Map<sessionKey, changes[]>

exports.logTaskChange = async (req, res) => {
  const { taskId, timestamp, timeSpent, changes } = req.body;
  const userId = req.userId;

  if (!taskId || !changes) {
    return res.status(400).json({ message: 'Invalid input. Required: taskId, changes' });
  }

  try {
    // Store in memory - will be saved when session ends
    const sessionKey = `user_${userId}`;
    if (!pendingTaskChanges.has(sessionKey)) {
      pendingTaskChanges.set(sessionKey, []);
    }
    pendingTaskChanges.get(sessionKey).push({
      taskId,
      timestamp: timestamp || new Date().toISOString(),
      timeSpent,
      changes,
    });

    res.status(200).json({ message: 'Task change logged' });
  } catch (error) {
    console.error('Error logging task change:', error);
    res.status(500).json({ message: 'Failed to log task change' });
  }
};

// Helper to get and clear pending changes for a user
exports.getPendingChanges = (userId) => {
  const sessionKey = `user_${userId}`;
  const changes = pendingTaskChanges.get(sessionKey) || [];
  pendingTaskChanges.delete(sessionKey);
  return changes;
};
